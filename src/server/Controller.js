import ImageProblem from '../problem-engine/ImageProblem';
import BinaryTreeProblem from '../problem-engine/BinaryTreeProblem';
import {
    problem,
    addSolution,
    getObjectResources,
    addToResourceCount,
    markAsCollected,
    getPlayerResources
} from './db';
import { getSolutions, solvedProblem, deletePlayerId } from './db/index';
import { siegeItems } from '../config';

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

class Controller {
    constructor() {
        this.socketsMap = {};
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
            if (!socket.auth) throw new Error('User is not authenticated');

            let userId = socket.client.userId;
            await addSolution(userId, data.problemId, data.code);

            let solutions = await getSolutions(userId);
            socket.emit('solvedProblems', solutions);
            // Let all players know this problem has been solved
            this.gameEngine.markAsSolved(data.problemId, playerNumber);
            for (const sock of Object.values(this.socketsMap)) {
                sock.emit('solution', {
                    problemId: data.problemId,
                    playerId: playerNumber
                });
            }

            this.addBot(playerId, playerNumber, data.problemId);
        });

        socket.on('solvedProblems', async () => {
            if (!socket.auth) throw new Error('User is not authenticated');

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
                await Promise.all(
                    Object.entries(resources).map(async (pair) => {
                        let { 0: name, 1: count } = pair;
                        return await addToResourceCount(playerId, name, -count);
                    })
                );

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
                console.error('Could not make defence: ', error.message);
            }
        });

        socket.on('siegeItems', () => {
            socket.emit('siegeItems', siegeItems);
        });

        this.socketsMap[playerId] = socket;
        //this.pushCount();
        console.log(`added player ${playerId}`);
    }

    getDefenceCost(defenceId) {
        let item = siegeItems.find((elem) => elem.id == defenceId);
        return item.cost;
    }

    addBot(playerId, playerNumber, problemId) {
        let position = this.gameWorld.getStartingPosition(playerNumber);
        let bot = this.gameEngine.addBot({
            type: 'collector',
            playerId: playerId,
            playerNumber: playerNumber,
            problemId: problemId,
            position: position
        });
        bot.attach(this, this.gameWorld, this.gameEngine);
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

    async pushCount(playerId, name, count, shouldReset = false) {
        this.pushData(playerId, 'resourceUpdate', {
            name: name,
            count: count,
            shouldReset: shouldReset
        });
    }

    async pushProblem(playerId, dbId) {
        let socket = this.socketsMap[playerId];
        let prob = (await problem(dbId, socket.client.userId)).problem;
        let serialized = await serialize(prob);

        if (!prob.id) {
            throw Error('Problem not found');
        }

        // TODO: temporary; should only be on solved problem
        if (!socket.bot) {
            this.addBot(playerId, socket.playerId, prob.id);
            socket.bot = true;
        }

        this.pushData(playerId, 'problem', { ...prob, problem: serialized });
    }

    removePlayer(playerId) {
        let socket = this.socketsMap[playerId];
        if (socket) {
            deletePlayerId(socket.client.userId, playerId);
            delete this.socketsMap[playerId];
        }
    }

    /**
     * Method for pushing data to the client
     * @param {string} playerId
     * @param {string} channel
     * @param {*} data
     */
    pushData(playerId, channel, data) {
        let socket = this.socketsMap[playerId];
        if (!socket.auth) throw new Error('User is not authenticated');

        socket.emit(channel, data);
    }
}

export default new Controller();
