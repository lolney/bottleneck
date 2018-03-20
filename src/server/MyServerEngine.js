'use strict';

import ServerEngine from 'lance/ServerEngine';
import PlayerAvatar from '../common/PlayerAvatar';

export default class MyServerEngine extends ServerEngine {

    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
    }

    start() {
        super.start();
    }

    onPlayerConnected(socket) {
        super.onPlayerConnected(socket);
        this.gameEngine.makePlayer(socket.playerId);
    }

    onPlayerDisconnected(socketId, playerId) {
        super.onPlayerDisconnected(socketId, playerId);
        console.log(`removing player ${playerId}`);
        let playerObjects = this.gameEngine.world.queryObjects({ playerId: playerId });
        playerObjects.forEach(obj => {
            this.gameEngine.removeObjectFromWorld(obj.id);
        });
    }
}
