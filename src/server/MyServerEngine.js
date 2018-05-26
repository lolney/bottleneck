'use strict';

import ServerEngine from 'lance/ServerEngine';
import Avatar from '../common/Avatar';
import PlayerAvatar from '../common/PlayerAvatar';
import Controller, { problemEmitter } from './Controller';

export default class MyServerEngine extends ServerEngine {

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
    }

    start() {
        super.start();
        this.gameEngine.makeTrees();
        this.gameEngine.on('collisionStart', MyServerEngine.collision.bind(this));
        this.socketsMap = {};
    }

    static collision(e) {
        let collisionObjects = Object.keys(e).map(k => e[k]);
        let object = collisionObjects.find(o => o instanceof Avatar);
        let player = collisionObjects.find(o => o instanceof PlayerAvatar);

        if (!object || !player)
            return;

        console.log('Emitting problem:display event: ', player.playerId);

        Controller.pushProblem(this.socketsMap[player.playerId], player.playerId);
        problemEmitter.emit('display', player.playerId);
    }


    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        this.socketsMap[socket.playerId] = socket;
        this.gameEngine.makePlayer(socket.playerId);
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);
        console.log(`removing player ${playerId}`);
        let playerObjects = this.gameEngine.world.queryObjects({ playerId: playerId });
        playerObjects.forEach((obj) => {
            this.gameEngine.removeObjectFromWorld(obj.id);
        });
        delete this.socketsMap[playerId];
    }
}
