import ImageProblem from '../problem-engine/ImageProblem';
import { problem } from './db/views';

export default class Controller {
    static pushProblem(socket, playerId, dbId) {
        problem(dbId)
            .then((problem) => {
                return new ImageProblem(problem.original).serialize();
            })
            .then((serialized) => {
                console.log('Authenticated: ', socket.auth);
                socket.emit('problem', serialized);
            });
    }
}
