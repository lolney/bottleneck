'use strict';

import ServerEngine from 'lance/ServerEngine';
import Avatar from '../common/Avatar';
import PlayerAvatar from '../common/PlayerAvatar';
import Controller from './Controller';
import { objects } from './db/views/gameObject';
import GameWorld from './GameWorld';
import logger from './Logger';

export default class MyServerEngine extends ServerEngine {
    constructor(io, gameEngine, inputOptions) {
        super(io, gameEngine, inputOptions);
        this.gameWorld = GameWorld.generate();
        this.controller = new Controller(gameEngine, this.gameWorld);

        this.players = {
            1: undefined,
            2: undefined
        };
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

                const id = socket.client.playerDbId;
                const number = socket.playerId;

                this.createPlayer(id, number);
                this.controller.addPlayer(id, number, socket);
            } else setTimeout(waitForAuth, 100);
        };
        waitForAuth();
    }

    createPlayer(id, number) {
        this.gameEngine.makePlayer(
            id,
            number,
            this.gameWorld.getStartingPosition(number)
        );
        this.gameEngine.emit('playerAdded', {
            playerId: id,
            playerNumber: number
        });
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

        this.players[playerNumber] = undefined;
    }

    getPlayerId(socket) {
        logger.info('Assigning player number');
        for (const [num, player] of Object.entries(this.players)) {
            if (player == undefined) {
                this.players[num] = socket;
                return num;
            }
        }
        throw new Error('Could not assign playerNumber to new player');
    }
}
