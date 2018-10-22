'use strict';

import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import { checkPassword, getUserId, setPlayerId } from './src/server/db';
import MatchMaker from './src/server/MatchMaker';

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

/*
import bodyParser from 'body-parser';
server.use(bodyParser);
server.post('/solution', function(req, res) {
    addSolution(req.user, req.query.problemId, req.body);
});*/

// Socket auth
const io = socketIO(requestHandler);
require('socketio-auth')(io, {
    authenticate: async function(socket, data, callback) {
        let username = data.username;
        let password = data.password;

        console.log(`User is logging in: ${data.username}`);
        let succeeded = await checkPassword(username, password);
        console.log(`Authentication succeeded: ${succeeded}`);

        let userId = await getUserId(username);
        socket.client.userId = userId;

        console.log('got user id');

        let player = await setPlayerId(userId, socket.playerId);
        socket.client.playerDbId = player.id;

        console.log('added player to db');
        callback(null, succeeded);
    },
    timeout: 'none'
});

// Create the Matchmaker
new MatchMaker(io);
