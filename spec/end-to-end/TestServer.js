import express from 'express';
import socketIO from 'socket.io';
import MatchMaker from '../../src/server/MatchMaker';
import InstanceManager from '../../src/server/InstanceManager';
import logger from '../../src/server/Logger';
import TestClient from './TestClient';

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

    static async create(options = {}) {
        const server = express();
        const PORT = getPort();

        let requestHandler = server.listen(PORT, () =>
            logger.info(`Listening on ${PORT}`)
        );
        const io = socketIO(requestHandler);

        const instanceManager = new InstanceManager(io);
        const gameId = await instanceManager.createInstance(options);

        return new TestServer(gameId, PORT, instanceManager);
    }

    static async createPracticeServer() {
        let server = await TestServer.create({ practice: true });
        let promise = new Promise((resolve) =>
            server.gameEngine.on('playerAdded', () => resolve())
        );

        let client = new TestClient(server.serverURL);
        let socket = await client.start();

        await promise;

        return { server, client, socket };
    }

    get gameEngine() {
        return this.instanceManager.instances[this.gameId].gameEngine;
    }

    get players() {
        return Object.values(this.instance.serverEngine.players);
    }

    get playerIds() {
        return this.players.map((socket) => socket.client.playerDbId);
    }

    get instance() {
        return this.instanceManager.instances[this.gameId];
    }

    socket(i) {
        return this.instance.serverEngine.players[i];
    }

    get events() {
        return this.instanceManager.eventEmitter;
    }
}
