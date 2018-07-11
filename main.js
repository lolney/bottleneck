'use strict';

import express from 'express';
import socketIO from 'socket.io';
import path from 'path';

import Controller from './src/server/Controller';

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
const io = socketIO(requestHandler);
require('socketio-auth')(io, {
    authenticate: function(socket, data, callback) {
        // get credentials sent by the client
        let username = data.username;
        let password = data.password;

        console.log(`Received credentials: ${data.username}, ${data.password}`);
        let db = {
            findUser: (string, username, callback) => {
                callback(null, { password: 'username' });
            }
        };
        db.findUser('User', { username: username }, (err, user) => {
            // inform the callback of auth success/failure
            if (err || !user) return callback(new Error('User not found'));
            return callback(null, user.password == password);
        });
    }
});

server.get('/problem/:playerId/', (req, res) => {
    Controller.getProblem(req, res);
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
