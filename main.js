'use strict';

import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import { checkPassword } from './src/server/db/views';

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './index.html');

// define routes and socket
const server = express();
server.get('/', function(req, res) {
    res.sendFile(INDEX);
});
server.use('/', express.static(path.join(__dirname, '.')));
let requestHandler = server.listen(PORT, () =>
    console.log(`Listening on ${PORT}`)
);

// Socket auth
const io = socketIO(requestHandler);
require('socketio-auth')(io, {
    authenticate: async function(socket, data, callback) {
        let username = data.username;
        let password = data.password;

        console.log(`Received credentials: ${data.username}, ${data.password}`);
        let succeeded = await checkPassword(username, password);
        console.log(`Authentication succeeded: ${succeeded}`);
        callback(null, succeeded);
    }
});

// Game Server
import Trace from 'lance/lib/Trace';
import MyServerEngine from './src/server/MyServerEngine';
import MyGameEngine from './src/common/MyGameEngine';

// Game Instances
const gameEngine = new MyGameEngine({ traceLevel: Trace.TRACE_NONE });
const serverEngine = new MyServerEngine(io, gameEngine, {
    debug: {},
    updateRate: 6,
    timeoutInterval: 0
});

// start the game
serverEngine.start();
