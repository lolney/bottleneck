import ImageProblem from '../problem-engine/ImageProblem';
import BinaryTreeProblem from '../problem-engine/BinaryTreeProblem';
import { problem, addSolution } from './db';

export default class Controller {
    /**
     * Register the routes for `socket`
     * @param {socketIO} socket
     */
    static register(socket) {
        let solutionHandler = () => {
            socket.on('solution', (data) => {
                if (!socket.auth) throw new Error('User is not authenticated');

                let userId = socket.client.userId;
                addSolution(userId, data.problemId, data.code);
            });
        };
        solutionHandler();
    }

    static pushProblem(socket, playerId, dbId) {
        if (!socket.auth) throw new Error('User is not authenticated');

        problem(dbId)
            .then((problem) => {
                switch (problem.type) {
                case 'btree':
                    return new BinaryTreeProblem(problem.id).serialize();
                case 'image':
                    return new ImageProblem(
                        problem.original,
                        problem.id
                    ).serialize();
                default:
                    throw new TypeError(`Unexpected type: ${problem.type}`);
                }
            })
            .then((serialized) => {
                console.log('Authenticated: ', socket.auth);
                socket.emit('problem', serialized);
            })
            .catch((err) => {
                console.log(`Unable to push problem: ${err}`);
            });
    }
}
