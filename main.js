import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import matchmakingRouter from './src/server/routers/matchmaking';
import logger from './src/server/Logger';
import Auth from './src/server/auth/flow';
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN
    });
} else {
    logger.warning('SENTRY_DSN env variable not set');
}

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '/static');
const ASSETS = path.join(__dirname, '/assets');
const DIST = path.join(__dirname, '/dist');

// define routes and socket
const server = express();
let requestHandler = server.listen(PORT, () =>
    logger.info(`Listening on ${PORT}`)
);

const io = socketIO(requestHandler);

const handler = (req, res) => res.sendFile(path.join(INDEX, 'index.html'));

server.use(express.static(INDEX));
server.use('/assets', express.static(ASSETS));
['/implicit/callback', '/', '/login'].map((route) =>
    server.get(route, handler)
);
server.use('/dist', express.static(DIST));

server.use(matchmakingRouter(io, Auth));

export default server;
