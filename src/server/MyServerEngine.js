'use strict';

import ServerEngine from 'lance/ServerEngine';
import Avatar from '../common/Avatar';
import PlayerAvatar from '../common/PlayerAvatar';
import Controller from './Controller';
import { objects } from './db';

export default class MyServerEngine extends ServerEngine {
    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
    }

    async start() {
        super.start();
        let objs = await objects();
        this.gameEngine.makeTrees(objs);
        this.gameEngine.on(
            'collisionStart',
            MyServerEngine.collision.bind(this)
        );
        this.socketsMap = {};
    }

    static collision(e) {
        let collisionObjects = Object.keys(e).map((k) => e[k]);
        let object = collisionObjects.find((o) => o instanceof Avatar);
        let player = collisionObjects.find((o) => o instanceof PlayerAvatar);

        if (!object || !player) return;

        console.log('Emitting problem:display event: ', player.playerId);
        console.log('Object id: ', object.dbId);

        Controller.pushProblem(
            this.socketsMap[player.playerId],
            player.playerId,
            object.dbId
        );
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        this.socketsMap[socket.playerId] = socket;
        Controller.register(socket);
        this.gameEngine.makePlayer(socket.playerId);
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);
        console.log(`removing player ${playerId}`);
        let playerObjects = this.gameEngine.world.queryObjects({
            playerId: playerId
        });
        playerObjects.forEach((obj) => {
            this.gameEngine.removeObjectFromWorld(obj.id);
        });
        delete this.socketsMap[playerId];
    }
}
