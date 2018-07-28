import ImageProblem from '../problem-engine/ImageProblem';
import BinaryTreeProblem from '../problem-engine/BinaryTreeProblem';
import { problem, addSolution } from './db';
import { getSolutions, solvedProblem } from './db/index';

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

export default class Controller {
    /**
     * Register the routes for `socket`
     * @param {socketIO} socket
     */
    static register(socket) {
        let solutionHandler = () => {
            socket.on('solution', async (data) => {
                if (!socket.auth) throw new Error('User is not authenticated');

                let userId = socket.client.userId;
                await addSolution(userId, data.problemId, data.code);

                let solutions = await getSolutions(userId);
                socket.emit('solvedProblems', solutions);
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
    }

    static pushProblem(socket, playerId, dbId) {
        if (!socket.auth) throw new Error('User is not authenticated');

        problem(dbId)
            .then((problem) => {
                return serialize(problem);
            })
            .then((serialized) => {
                console.log('Authenticated: ', socket.auth);
                socket.emit('problem', serialized);
            });
    }
}
