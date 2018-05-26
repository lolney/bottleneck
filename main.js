'use strict';

import express from 'express';
import socketIO from 'socket.io';
import path from 'path';

import MyServerEngine, { problemEmitter } from './src/server/MyServerEngine';

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

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './index.html');

// define routes and socket
const server = express();
server.get('/', function (req, res) { res.sendFile(INDEX); });
server.use('/', express.static(path.join(__dirname, '.')));
let requestHandler = server.listen(PORT, () => console.log(`Listening on ${PORT}`));
const io = socketIO(requestHandler);

server.get('/problem/:playerId/', (req, res) => {
    if (problemQueue.dequeue(req.params.playerId)) {
        console.log("sending problem");
        res.json({ title: 'New problem' });
    } else {
        res.status(204).send('No problem yet');
    }
});

// Game Server
import MyGameEngine from './src/common/MyGameEngine';
import Trace from 'lance/lib/Trace';

// Game Instances
const gameEngine = new MyGameEngine({ traceLevel: Trace.TRACE_NONE });
const serverEngine = new MyServerEngine(io, gameEngine, { debug: {}, updateRate: 6, timeoutInterval: 0 });

// start the game
serverEngine.start();
