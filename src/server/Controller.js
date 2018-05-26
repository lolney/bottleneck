import ImageProblem from '../problem-engine/ImageProblem';
import EventEmitter from 'events';
//import { rendered } from '../react-app/ImageProblem.jsx';

export class ProblemEmitter extends EventEmitter { }
export const problemEmitter = new ProblemEmitter();

class ProblemQueue {
    constructor() {
        this.problemQueue = {};
    }

    enqueue(playerId) {
        this.problemQueue[playerId] = true;
    }

    dequeue(playerId) {
        if (this.problemQueue[playerId]) {
            return delete this.problemQueue[playerId];
        } else {
            return false;
        }
    }
}

let problemQueue = new ProblemQueue();
problemEmitter.on('display', (playerId) => {
    problemQueue.enqueue(playerId);
});

export default class Controller {
    static getProblem(req, res) {
        if (problemQueue.dequeue(req.params.playerId)) {
            console.log("sending problem");
            res.json({ title: 'New problem' });
        } else {
            res.status(204).send('No problem yet');
        }
    }

    static pushProblem(socket, playerId) {
        // TODO: look up problem for this object in the DB
        let problem = new ImageProblem();
        // TODO: send react component instead
        socket.emit('problem',
            {
                title: problem.getTitle(),
                description: problem.getDescription(),/*
                original: rendered(),
                target: rendered(),*/
            }
        );
    }
}
