import ImageProblem from '../problem-engine/ImageProblem';
import BinaryTreeProblem from '../problem-engine/BinaryTreeProblem';
import { problem, addSolution } from './db';
import { getSolutions, solvedProblem, setPlayerId } from './db/index';

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

    attachGameEngine(gameEngine) {
        this.gameEngine = gameEngine;
    }
    /**
     * Register the routes for `socket`
     * @param {socketIO} socket
     */
    addPlayer(playerId, socket) {
        let solutionHandler = () => {
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
            });
        };

        let solvedProblemsHandler = () => {
            socket.on('solvedProblems', async () => {
                if (!socket.auth) throw new Error('User is not authenticated');

                let userId = socket.client.userId;
                let solutions = await getSolutions(userId);
                socket.emit('solvedProblems', solutions);
            });
        };

        let problemHandler = () => {
            socket.on('solvedProblem', async (data) => {
                let solved = await solvedProblem(data.id);
                let problem = await serialize(solved.problem);
                socket.emit('solvedProblem', {
                    ...solved,
                    problem: problem
                });
            });
        };

        solutionHandler();
        solvedProblemsHandler();
        problemHandler();
        this.socketsMap[playerId] = socket;
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
