'use strict';

import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import MatchMaker from './src/server/MatchMaker';
import logger from './src/server/Logger';

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, './index.html');

// define routes and socket
const server = express();
server.get('/', function(req, res) {
    res.sendFile(INDEX);
});
server.use('/', express.static(path.join(__dirname, '.')));
let requestHandler = server.listen(PORT, () =>
    logger.info(`Listening on ${PORT}`)
);

const io = socketIO(requestHandler);

// Create the Matchmaker
new MatchMaker(io);
