import ImageProblem from '../problem-engine/ImageProblem';
import BinaryTreeProblem from '../problem-engine/BinaryTreeProblem';
import {
    problem,
    addSolution,
    getObjectResources,
    addToResourceCount,
    markAsCollected,
    getPlayerResources,
    decrementHP
} from './db';
import { getSolutions, solvedProblem, deletePlayerId } from './db/index';
import { siegeItems, assaultBot } from '../config';
import logger from './Logger';
import { log } from 'util';
import { Status } from '../common/MyGameEngine';

function serialize(problem) {
    switch (problem.type) {
    case 'btree':
        return new BinaryTreeProblem(problem.id).serialize();
    case 'image':
        return new ImageProblem(
            problem.subproblem.original,
            problem.id
        ).serialize();
    default:
        throw new TypeError(`Unexpected type: ${problem.type}`);
    }
}

function handleAuth(socket) {
    // @unimplemented
    if (!socket.auth) throw new Error('User is not authenticated');
}

/**
 * Mediates interaction between the client, server-side game engine,
 * and DB. Must be initialized with {@link Controller#attachGameEngine}.
 */
class Controller {
    constructor(gameEngine, gameWorld) {
        this.playerMap = new PlayerMap();
        this.gameEngine = gameEngine;
        this.gameWorld = gameWorld;
    }

    /**
     * Register the routes for `socket`
     * @param {socketIO} socket
     */
    addPlayer(playerId, playerNumber, socket) {
        socket.on('solution', async (data) => {
            handleAuth(socket);

            let userId = socket.client.userId;
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
            handleAuth(socket);

            let userId = socket.client.userId;
            let solutions = await getSolutions(userId);
            socket.emit('solvedProblems', solutions);
        });

        socket.on('solvedProblem', async (data) => {
            let solved = await solvedProblem(data.id);
            let problem = await serialize(solved.problem);
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

        socket.on('makeDefense', async (data) => {
            let resources = this.getDefenseCost(data.defenseId);

            await this.deductResourceCosts(playerId, resources);

            let defense = this.gameEngine.makeDefense(
                data.defenseId,
                data.position,
                playerNumber
            );
            this.gameWorld.update(defense);
            this.gameEngine.resetBots();
        });

        socket.on('mergeDefenses', async (data) => {
            let resources = this.getDefenseCost(data.defenseId);

            try {
                await this.deductResourceCosts(playerId, resources);

                let defense = this.gameEngine.queryObject({
                    id: data.gameObjectId
                });
                defense.attachCounter(data.defenseId);
                this.gameWorld.remove(defense);
                this.gameEngine.resetBots();
            } catch (error) {
                logger.error(`Could not merge defenses: ${error.message}`);
            }
        });

        socket.on('makeAssaultBot', async (data) => {
            let resources = assaultBot.cost;

            try {
                await this.deductResourceCosts(playerId, resources);
                this.addAssaultBot(playerId, playerNumber);
            } catch (error) {
                logger.error(`Could not create Assault bot: ${error.message}`);
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
     */
    addBot(config) {
        let position = this.gameWorld.getStartingPosition(config.playerNumber);
        config = Object.assign(config, { position: position });
        let bot = this.gameEngine.addBot(config);
        bot.attach(this, this.gameWorld, this.gameEngine);
    }

    /**
     * @private
     * @param {string} playerId
     * @param {number} playerNumber
     * @param {string} problemId
     */
    addCollectorbot(playerId, playerNumber, problemId) {
        let config = {
            type: 'collector',
            playerId: playerId,
            playerNumber: playerNumber,
            problemId: problemId
        };
        this.addBot(config);
    }

    /**
     * @private
     * @param {string} playerId
     * @param {number} playerNumber
     */
    addAssaultBot(playerId, playerNumber) {
        let opponentNumber = playerNumber == 1 ? 2 : 1;
        let opponent = this.gameEngine.getPlayerByNumber(opponentNumber);

        if (opponent) {
            let config = {
                type: 'assault',
                playerId: playerId,
                opponentPlayerId: opponent.playerId,
                playerNumber: playerNumber
            };
            this.addBot(config);
        } else {
            logger.error(
                `Attempted to add assault bot for player ${playerNumber}, but no opponent found`
            );
        }
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
        if(this.gameEngine.status != Status.DONE) {
            this.gameEngine.setStatus(Status.DONE);

            let winningPlayer = this.playerMap.getOtherPlayerId(enemyPlayerId);
            logger.info(`Player ${winningPlayer} has won the game`);
            this.playerMap.publish(winningPlayer, 'gameWin', {});
            this.playerMap.publish(enemyPlayerId, 'gameLose', {});
        }
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
        let serialized = await serialize(prob);

        if (!prob.id) {
            throw Error('Problem not found');
        }

        // TODO: temporary; should only be on solved problem
        if (!this.playerMap.botExists(playerId)) {
            this.addCollectorbot(
                playerId,
                this.playerMap.getPlayerNumber(playerId),
                prob.id
            );
            this.playerMap.setBotExists(playerId);
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
        handleAuth(socket);

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

    getPlayerNumber(playerId) {
        let socket = this.getPlayer(playerId);
        return socket.playerId;
    }

    getUserId(playerId) {
        let socket = this.getPlayer(playerId);
        return socket.client.userId;
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
            deletePlayerId(socket.client.userId, playerId);
            delete this.socketsMap[playerId];
        }
    }
}

export default Controller;
