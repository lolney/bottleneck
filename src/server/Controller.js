import ImageProblem from '../problem-engine/ImageProblem';
import BinaryTreeProblem from '../problem-engine/BinaryTreeProblem';

import {
    problem,
    getObjectResources,
    markAsCollected
} from './db/views/gameObject';
import {
    addToResourceCount,
    decrementHP,
    deletePlayerId,
    getPlayerResources
} from './db/views/player';
import {
    addSolution,
    getSolutions,
    solvedProblem
} from './db/views/solvedProblem';

import { siegeItems, assaultBot, getSiegeItemFromId } from '../config';
import logger from './Logger';
import { GameStatus as Status } from '../common/types';
import Socket, { Response } from '../common/Socket';
import ProblemGenerator from '../problem-engine/ProblemGenerator';
import FeatureFlags from '../FeatureFlags';

/**
 * Mediates interaction between the client, server-side game engine,
 * and DB. Must be initialized with {@link Controller#attachGameEngine}.
 */
class Controller {
    constructor(gameEngine, gameWorld, config) {
        this.playerMap = new PlayerMap();
        this.gameEngine = gameEngine;
        this.gameWorld = gameWorld;

        this.featureFlags = new FeatureFlags(config);
    }

    /**
     * Register the routes for `socket`
     *
     * See readme for documentation.
     *
     * @param {socketIO} socket
     */
    addPlayer(playerId, playerNumber, socket) {
        socket = new Socket(socket);

        socket.on('solution', async (data) => {
            let userId = socket.userId;
            await addSolution(userId, data.problemId, data.code);

            let solutions = await getSolutions(userId);
            socket.emit('solvedProblems', solutions);
            // Let all players know this problem has been solved
            this.gameEngine.markAsSolved(data.problemId, playerNumber);
            this.playerMap.publishAll('solution', {
                problemId: data.problemId,
                playerId: playerNumber
            });
            this.addCollectorbot(playerId, playerNumber, data.problemId);
        });

        socket.on('solvedProblems', async () => {
            let userId = socket.userId;
            let solutions = await getSolutions(userId);
            socket.emit('solvedProblems', solutions);
        });

        socket.on('solvedProblem', async (data) => {
            let solved = await solvedProblem(data.id);
            let problem = await ProblemGenerator.serialize(solved.problem);
            socket.emit('solvedProblem', {
                ...solved,
                problem: problem
            });
        });

        socket.on('resourceInitial', async () => {
            let resources = await getPlayerResources(playerId);
            let dict = {};
            for (const res of resources) {
                dict[res.name] = res.count;
            }
            socket.emit('resourceInitial', dict);
        });

        socket.transaction('makeDefense', async (data) => {
            if (getSiegeItemFromId(data.defenseId).type != 'defensive') {
                return Response.err(`Tried to add invalid defense: ${data}`);
            }

            let resources = this.getDefenseCost(data.defenseId);

            await this.deductResourceCosts(playerId, resources);

            let defense = this.gameEngine.makeDefense(
                data.defenseId,
                data.position,
                playerNumber
            );
            this.gameWorld.update(defense);
            this.gameEngine.resetBots();

            return Response.ok({
                dbId: defense.dbId,
                position: defense.position
            });
        });

        socket.transaction('mergeDefenses', async (data) => {
            if (getSiegeItemFromId(data.defenseId).type != 'offensive') {
                return Response.err(`Tried to add invalid offense: ${data}`);
            }

            let resources = this.getDefenseCost(data.defenseId);

            try {
                let defense = this.gameEngine.queryObject({
                    id: data.gameObjectId
                });

                if (!defense) {
                    throw new Error(
                        `GameObject '${data.gameObjectId}' does not exist`
                    );
                }

                if (!defense.attachCounter) {
                    throw new Error(
                        `Defense '${
                            data.gameObjectId
                        }' does not have method attachCounter`
                    );
                }

                await this.deductResourceCosts(playerId, resources);

                defense.attachCounter(data.defenseId);
                this.gameWorld.remove(defense);
                this.gameEngine.resetBots();
            } catch (error) {
                return Response.err(
                    `Could not merge defenses: ${error.message}`
                );
            }
        });

        socket.transaction('makeAssaultBot', async (data) => {
            let resources = assaultBot.cost;

            try {
                await this.deductResourceCosts(playerId, resources);
                const botCount = this.addAssaultBot(playerId, playerNumber);
                return Response.ok({ botCount });
            } catch (error) {
                return Response.err(
                    `Could not create Assault bot: ${error.message}`
                );
            }
        });

        socket.on('siegeItems', () => {
            socket.emit('siegeItems', siegeItems);
        });

        this.playerMap.addPlayer(playerId, socket);
        logger.debug(`added player ${playerId}`);
    }

    /**
     * @private
     */
    async deductResourceCosts(playerId, resources) {
        await Promise.all(
            Object.entries(resources).map(async (pair) => {
                let { 0: name, 1: count } = pair;
                return await addToResourceCount(playerId, name, -count);
            })
        );
        // Push costs
        Object.entries(resources).map((pair) => {
            let { 0: name, 1: count } = pair;
            this.pushCount(playerId, name, -count);
        });
    }

    /**
     * @private
     */
    getDefenseCost(defenseId) {
        let item = siegeItems.find((elem) => elem.id == defenseId);
        return item.cost;
    }

    /**
     * @private
     * @param {object} config
     * @param {number} config.playerNumber
     * @param {string} config.playerId
     * @param {string} config.type
     * @returns {number} - the number of active bots of this type that this player has
     */
    addBot(config) {
        let position = this.gameWorld.getStartingPosition(config.playerNumber);
        config = Object.assign(config, { position: position });

        let bot = this.gameEngine.addBot(config);
        bot.attach(this, this.gameWorld, this.gameEngine);

        return this.gameEngine.getNBots(config.playerNumber, config.type);
    }

    /**
     * @private
     * @param {string} playerId
     * @param {number} playerNumber
     * @param {string} problemId
     * @returns {number} - the number of active collector bots that this player has
     */
    addCollectorbot(playerId, playerNumber, problemId) {
        let config = {
            type: 'collectionBot',
            playerId: playerId,
            playerNumber: playerNumber,
            problemId: problemId
        };
        const nBots = this.addBot(config);
        this.publishBotCount('collectionBot', playerId, nBots);

        return nBots;
    }

    /**
     * @private
     * @param {string} playerId
     * @param {number} playerNumber
     * @returns {number} - the number of active assault bots that this player has
     */
    addAssaultBot(playerId, playerNumber) {
        let opponentNumber = playerNumber == 1 ? 2 : 1;
        let opponent = this.gameEngine.getPlayerByNumber(opponentNumber);

        if (opponent) {
            let config = {
                type: 'assaultBot',
                playerId: playerId,
                opponentPlayerId: opponent.playerId,
                playerNumber: playerNumber
            };
            return this.addBot(config);
        } else {
            throw new Error(
                `Attempted to add assault bot for player ${playerNumber}, but no opponent found`
            );
        }
    }

    onRemoveBot(botType, playerId, playerNumber) {
        const botCount = this.gameEngine.getNBots(playerNumber, botType);
        this.publishBotCount(botType, playerId, botCount);
    }

    publishBotCount(botType, playerId, botCount) {
        this.playerMap.publish(playerId, `${botType}Count`, { botCount });
    }

    async addToResourceCount(playerId, gameObjectId) {
        // lookup resources associated with this gameObjectId
        let resources = await getObjectResources(gameObjectId);
        // inc resources (need player id, count, and type of resource)
        for (const resource of resources) {
            addToResourceCount(playerId, resource.name, resource.count);
            // push a resource update to client
            this.pushCount(playerId, resource.name, resource.count);
        }
    }

    async markAsCollected(gameObjectId) {
        return markAsCollected(gameObjectId);
    }

    async doAssault(enemyPlayerId) {
        let hp = await decrementHP(enemyPlayerId);
        this.gameEngine.setBaseHP(enemyPlayerId, hp);

        logger.info(
            `Bot has reached enemy player's base, bringing it to ${hp} hp`
        );

        let getData = (playerId) => {
            let key = enemyPlayerId == playerId ? 'myHp' : 'enemyHp';
            let obj = {};
            obj[key] = hp;
            return obj;
        };
        this.playerMap.publishAll('hp', getData);

        if (hp <= 0) {
            this.doWinGame(enemyPlayerId);
        }
    }

    doWinGame(enemyPlayerId) {
        if (this.gameEngine.status != Status.DONE) {
            this.gameEngine.setStatus(Status.DONE);

            let winningPlayer = this.playerMap.getOtherPlayerId(enemyPlayerId);
            logger.info(`Player ${winningPlayer} has won the game`);

            this.playerMap.publish(winningPlayer, 'gameWin', {});
            // If in practice mode, other player doesn't exist
            if (this.playerMap.getPlayer(enemyPlayerId))
                this.playerMap.publish(enemyPlayerId, 'gameLose', {});
        }
    }

    broadcastGameState(state) {
        if (state == Status.SUSPENDED) {
            this.playerMap.setSuspended(true);
        } else {
            this.playerMap.setSuspended(false);
        }

        this.playerMap.publishAll('gameState', { state });
    }

    async pushCount(playerId, name, count, shouldReset = false) {
        this.playerMap.publish(playerId, 'resourceUpdate', {
            name: name,
            count: count,
            shouldReset: shouldReset
        });
    }

    async pushProblem(playerId, dbId) {
        let prob = (await problem(dbId, this.playerMap.getUserId(playerId)))
            .problem;
        let serialized = await ProblemGenerator.serialize(prob);

        if (!prob.id) {
            throw Error('Problem not found');
        }

        if (this.featureFlags.isDebug()) {
            if (!this.playerMap.botExists(playerId)) {
                this.addCollectorbot(
                    playerId,
                    this.playerMap.getPlayerNumber(playerId),
                    prob.id
                );
                this.playerMap.setBotExists(playerId);
            }
        }

        this.playerMap.publish(playerId, 'problem', {
            ...prob,
            problem: serialized
        });
    }

    removePlayer(playerId) {
        this.playerMap.removePlayer(playerId);
    }
}

/**
 * Stores playerId -> socket map and handles socket interaction
 */
class PlayerMap {
    constructor() {
        /**@private */
        this.socketsMap = {};
    }

    addPlayer(playerId, socket) {
        this.socketsMap[playerId] = socket;
    }

    /**@private */
    getPlayer(playerId) {
        return this.socketsMap[playerId];
    }

    getOtherPlayerId(playerId) {
        let others = Object.keys(this.socketsMap).filter(
            (id) => playerId != id
        );

        if (others.length == 0) {
            throw Error('Tried to win game when only one player is present');
        } else if (others.length > 1) {
            throw Error('More than two players in the game');
        } else {
            return others[0];
        }
    }

    /**
     * Method for pushing data to the client
     * @param {string} playerId
     * @param {string} channel
     * @param {*} data
     */
    publish(playerId, eventName, data) {
        let socket = this.getPlayer(playerId);

        socket.emit(eventName, data);
    }

    publishAll(eventName, data) {
        let getData;
        if (data instanceof Function) {
            getData = data;
        } else {
            getData = () => data;
        }

        for (const [id, sock] of Object.entries(this.socketsMap)) {
            sock.emit(eventName, getData(id));
        }
    }

    setSuspended(bool) {
        for (const sock of Object.values(this.socketsMap)) {
            sock.suspended = bool;
        }
    }

    getPlayerNumber(playerId) {
        let socket = this.getPlayer(playerId);
        return socket.playerNumber;
    }

    getUserId(playerId) {
        let socket = this.getPlayer(playerId);
        return socket.userId;
    }

    botExists(playerId) {
        let socket = this.getPlayer(playerId);
        return socket.bot === true;
    }

    setBotExists(playerId) {
        let socket = this.getPlayer(playerId);
        socket.bot = true;
    }

    removePlayer(playerId) {
        let socket = this.getPlayer(playerId);
        if (socket) {
            deletePlayerId(socket.userId, playerId);
            delete this.socketsMap[playerId];
        }
    }
}

export default Controller;
