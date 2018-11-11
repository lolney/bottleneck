import express from 'express';
import socketIO from 'socket.io';
import MatchMaker from '../../src/server/MatchMaker';
import logger from '../../src/server/Logger';

const PORT = process.env.PORT || 6000;

// define routes and socket

export default class TestServer {
    constructor() {
        const server = express();

        let requestHandler = server.listen(PORT, () =>
            logger.info(`Listening on ${PORT}`)
        );

        this.serverURL = `http://localhost:${PORT}`;
        const io = socketIO(requestHandler);
        this.matchMaker = new MatchMaker(io);
    }
}
