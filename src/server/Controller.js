import ImageProblem from '../problem-engine/ImageProblem';
import BinaryTreeProblem from '../problem-engine/BinaryTreeProblem';
import { problem } from './db/views';

export default class Controller {
    static pushProblem(socket, playerId, dbId) {
        problem(dbId)
            .then((problem) => {
                switch (problem.type) {
                case 'btree':
                    return new BinaryTreeProblem().serialize();
                case 'image':
                    return new ImageProblem(problem.original).serialize();
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
