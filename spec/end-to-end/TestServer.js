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
    constructor(gameId, port, instanceManager) {
        this.instanceManager = instanceManager;
        this.matchMaker = new MatchMaker(this.instanceManager);

        this.gameId = gameId;
        this.serverURL = `http://localhost:${port}/?gameid=${this.gameId}`;
    }

    static async create() {
        const server = express();
        const PORT = getPort();

        let requestHandler = server.listen(PORT, () =>
            logger.info(`Listening on ${PORT}`)
        );
        const io = socketIO(requestHandler);

        const instanceManager = new InstanceManager(io);
        const gameId = await instanceManager.createInstance();

        return new TestServer(gameId, PORT, instanceManager);
    }

    get gameEngine() {
        return this.instanceManager.instances[this.gameId].gameEngine;
    }

    get instance() {
        return this.instanceManager.instances[this.gameId];
    }
}
