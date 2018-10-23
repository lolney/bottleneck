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
        Controller.attachGameEngine(gameEngine, this.gameWorld);
    }

    async start() {
        super.start();
        let objs = await objects();
        this.gameEngine.makeTrees(objs);
        this.gameEngine.addObjects(this.gameWorld.getObjects());
        this.gameEngine.on('collisionStart', MyServerEngine.collision);
    }

    static collision(e) {
        let collisionObjects = Object.keys(e).map((k) => e[k]);
        let object = collisionObjects.find(
            (o) => o instanceof Avatar && o.behaviorType == 'resource'
        );
        let player = collisionObjects.find((o) => o instanceof PlayerAvatar);

        if (!object || !player) return;

        logger.debug('Emitting problem:display event: ', player.playerId);
        logger.debug('Object id: ', object.dbId);

        Controller.pushProblem(player.playerId, object.dbId);
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        let waitForAuth = () => {
            if (socket.auth) {
                logger.info('Authenticated. Creating player.');
                Controller.addPlayer(
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
                Controller.removePlayer(obj.playerId);
            }
        });
    }
}
