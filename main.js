import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import MatchMaker from './src/server/MatchMaker';
import logger from './src/server/Logger';

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '/static');
const ASSETS = path.join(__dirname, '/assets');
const DIST = path.join(__dirname, '/dist');

// define routes and socket
const server = express();

server.use(express.static(INDEX));
server.use('/assets', express.static(ASSETS));
server.use('/dist', express.static(DIST));

let requestHandler = server.listen(PORT, () =>
    logger.info(`Listening on ${PORT}`)
);

const io = socketIO(requestHandler);

// Create the Matchmaker
new MatchMaker(io);
