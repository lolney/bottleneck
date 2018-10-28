'use strict';

import ServerEngine from 'lance/ServerEngine';
import Avatar from '../common/Avatar';
import PlayerAvatar from '../common/PlayerAvatar';
import Controller from './Controller';
import { objects } from './db';
import GameWorld from './GameWorld';
import logger from './Logger';

export default class MyServerEngine extends ServerEngine {
    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.gameWorld = GameWorld.generate();
        this.controller = new Controller(gameEngine, this.gameWorld);
    }

    async start() {
        super.start();
        let objs = await objects();
        this.gameEngine.makeTrees(objs);
        this.gameEngine.addObjects(this.gameWorld.getObjects());

        this.gameEngine.registerCollisionStart(
            (o) => o instanceof Avatar && o.behaviorType == 'resource',
            (o) => o instanceof PlayerAvatar,
            (object, player) =>
                this.controller.pushProblem(player.playerId, object.dbId)
        );
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        let waitForAuth = () => {
            if (socket.auth) {
                logger.info('Authenticated. Creating player.');
                this.controller.addPlayer(
                    socket.client.playerDbId,
                    socket.playerId,
                    socket
                );
                this.gameEngine.makePlayer(
                    socket.client.playerDbId,
                    socket.playerId,
                    this.gameWorld.getStartingPosition(socket.playerId)
                );
            } else setTimeout(waitForAuth, 100);
        };
        waitForAuth();
    }

    onPlayerDisconnected(socketId, playerNumber) {
        super.onPlayerDisconnected(socketId, playerNumber);
        logger.info(`Removing player ${playerNumber}`);
        let playerObjects = this.gameEngine.queryObjects({
            playerNumber: playerNumber
        });
        playerObjects.forEach((obj) => {
            this.gameEngine.removeObjectFromWorld(obj.id);
            if (obj.playerId) {
                this.controller.removePlayer(obj.playerId);
            }
        });
    }
}
