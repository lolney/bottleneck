import express from 'express';
import socketIO from 'socket.io';
import MatchMaker from '../../src/server/MatchMaker';
import logger from '../../src/server/Logger';

let _PORT = 6000;

function getPort() {
    return _PORT++;
}

// define routes and socket

export default class TestServer {
    constructor() {
        const server = express();
        const PORT = getPort();

        let requestHandler = server.listen(PORT, () =>
            logger.info(`Listening on ${PORT}`)
        );

        this.serverURL = `http://localhost:${PORT}`;
        const io = socketIO(requestHandler);
        this.matchMaker = new MatchMaker(io);
    }

    get gameEngine() {
        return this.matchMaker.instance.gameEngine;
    }
}
