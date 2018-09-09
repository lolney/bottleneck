import ImageProblem from '../problem-engine/ImageProblem';
import BinaryTreeProblem from '../problem-engine/BinaryTreeProblem';
import { problem, addSolution } from './db';
import { getSolutions, solvedProblem, setPlayerId } from './db/index';
import { siegeItems } from '../../stories/fixtures';

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
    addPlayer(playerId, socket) {
        socket.on('solution', async (data) => {
            if (!socket.auth) throw new Error('User is not authenticated');

            let userId = socket.client.userId;
            await addSolution(userId, data.problemId, data.code);

            let solutions = await getSolutions(userId);
            socket.emit('solvedProblems', solutions);
            // Let all players know this problem has been solved
            this.gameEngine.markAsSolved(data.problemId, socket.playerId);
            for (const sock of Object.values(this.socketsMap)) {
                sock.emit('solution', {
                    problemId: data.problemId,
                    playerId: socket.playerId
                });
            }

            this.addBot(socket.playerId, data.problemId);
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

        socket.on('siegeItems', () => {
            socket.emit('siegeItems', siegeItems);
        });

        this.socketsMap[playerId] = socket;
    }

    addBot(playerId, problemId) {
        let position = this.gameWorld.getStartingPosition(playerId);
        let bot = this.gameEngine.addBot({
            type: 'collector',
            playerId: playerId,
            problemId: problemId,
            position: position
        });
        bot.attach(this.gameWorld, this.gameEngine);
    }

    async pushProblem(playerId, dbId) {
        let socket = this.socketsMap[playerId];
        if (!socket.auth) throw new Error('User is not authenticated');

        let prob = await problem(dbId, socket.client.userId);
        let serialized = await serialize(prob.problem);

        console.log('Authenticated: ', socket.auth);
        socket.emit('problem', { ...prob, problem: serialized });
    }

    removePlayer(playerId) {
        let socket = this.socketsMap[playerId];
        setPlayerId(socket.client.userId, null);
        delete this.socketsMap[playerId];
    }
}

export default new Controller();
