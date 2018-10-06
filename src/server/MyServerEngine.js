'use strict';

import ServerEngine from 'lance/ServerEngine';
import GameObject from '../common/GameObject';
import PlayerAvatar from '../common/PlayerAvatar';
import Controller from './Controller';
import { objects } from './db';
import GameWorld from './GameWorld';

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
        let object = collisionObjects.find((o) => o instanceof GameObject);
        let player = collisionObjects.find((o) => o instanceof PlayerAvatar);

        if (!object || !player) return;

        console.log('Emitting problem:display event: ', player.playerId);
        console.log('Object id: ', object.dbId);

        Controller.pushProblem(player.playerId, object.dbId);
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        let waitForAuth = () => {
            if (socket.auth) {
                console.log('Authenticated. Creating player.');
                Controller.addPlayer(
                    socket.client.playerDbId,
                    socket.playerId,
                    socket
                );
                this.gameEngine.makePlayer(
                    socket.client.playerDbId,
                    socket.playerId
                );
            } else setTimeout(waitForAuth, 100);
        };
        waitForAuth();
    }

    onPlayerDisconnected(socketId, playerNumber) {
        super.onPlayerDisconnected(socketId, playerNumber);
        console.log(`removing player ${playerNumber}`);
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
