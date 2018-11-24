import express from 'express';
import socketIO from 'socket.io';
import MatchMaker from '../../src/server/MatchMaker';
import InstanceManager from '../../src/server/InstanceManager';
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

        const io = socketIO(requestHandler);

        this.instanceManager = new InstanceManager(io);
        this.matchMaker = new MatchMaker(this.instanceManager);

        this.gameId = this.instanceManager.createInstance();
        this.serverURL = `http://localhost:${PORT}/?gameid=${this.gameId}`;
    }

    get gameEngine() {
        return this.instanceManager.instances[this.gameId].gameEngine;
    }
}
