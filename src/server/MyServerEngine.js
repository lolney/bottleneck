'use strict';

import ServerEngine from 'lance/ServerEngine';
import EventEmitter from 'events';
import Avatar from '../common/Avatar';
import PlayerAvatar from '../common/PlayerAvatar';

export class ProblemEmitter extends EventEmitter { }
export const problemEmitter = new ProblemEmitter();

export default class MyServerEngine extends ServerEngine {

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
    }

    start() {
        super.start();
        this.gameEngine.makeTrees();
        this.gameEngine.on('collisionStart', MyServerEngine.collision);
    }

    static collision(e) {
        let collisionObjects = Object.keys(e).map(k => e[k]);
        let object = collisionObjects.find(o => o instanceof Avatar);
        let player = collisionObjects.find(o => o instanceof PlayerAvatar);

        if (!object || !player)
            return;

        console.log("Emitting problem:display event");
        problemEmitter.emit('display', player.playerId);
    }


    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        this.gameEngine.makePlayer(socket.playerId);
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);
        console.log(`removing player ${playerId}`);
        let playerObjects = this.gameEngine.world.queryObjects({ playerId: playerId });
        playerObjects.forEach((obj) => {
            this.gameEngine.removeObjectFromWorld(obj.id);
        });
    }
}
