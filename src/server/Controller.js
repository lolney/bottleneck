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
    constructor() {
        this.playerMap = new PlayerMap();
    }

    attachGameEngine(gameEngine, gameWorld) {
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

        socket.on('makeDefence', async (data) => {
            let resources = this.getDefenceCost(data.defenceId);

            try {
                this.deductResourceCosts(resources);

                let defence = this.gameEngine.makeDefence(
                    data.defenceId,
                    data.position
                );
                this.gameWorld.update(defence);
                Object.entries(resources).map((pair) => {
                    let { 0: name, 1: count } = pair;
                    this.pushCount(playerId, name, -count);
                });
            } catch (error) {
                logger.error(`Could not make defence: ${error.message}`);
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
        //this.pushCount();
        if(this.playerMap.socketsMap.length == 2) {
            this.doWinGame(playerId);
        }
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
    }

    /**
     * @private
     */
    getDefenceCost(defenceId) {
        let item = siegeItems.find((elem) => elem.id == defenceId);
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
        // @temporary
        this.addAssaultBot(playerId, playerNumber);
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
        if (hp <= 0) {
            this.doWinGame(enemyPlayerId);
        }
    }

    doWinGame(enemyPlayerId) {
        let winningPlayer = this.playerMap.getOtherPlayerId(enemyPlayerId);
        this.playerMap.publish(winningPlayer, 'gameWin', {});
        this.playerMap.publish(enemyPlayerId, 'gameLoss', {});
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
            (id) => playerId != playerId
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
        for (const sock of Object.values(this.socketsMap)) {
            sock.emit(eventName, data);
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

export default new Controller();
