import Instance from './Instance';
import { checkPassword, getUserId, getBotUserId } from './db/views/user';
import { createGame } from './db/views/game';
import { getPlayer, doesPlayerExist } from './db/views/player';
import logger from './Logger';
import socketioAuth from 'socketio-auth';
import { EventEmitter } from 'events';

export default class InstanceManager {
    constructor(io) {
        this.instances = {};
        this.instanceQueue = new InstanceQueue();
        this.eventEmitter = new EventEmitter();

        if (io) {
            this.handleAuth(io);
        }
    }

    handleAuth(io) {
        socketioAuth(io, {
            authenticate: async (socket, data, callback) => {
                try {
                    this.onPlayerConnected(socket);
                } catch (error) {
                    logger.error(`Error adding player to game: ${error}`);
                    callback(null, false);
                    return;
                }

                let username = data.username;
                let password = data.password;
                let gameId = socket.handshake.query.gameid;
                let playerNumber = socket.playerId;

                let userId = await getUserId(username);

                logger.info(`User is logging in: ${data.username}`);
                let succeeded = await checkPassword(username, password);
                logger.info(`Authentication succeeded: ${succeeded}`);

                let playerExists = await doesPlayerExist(userId, gameId);
                let player = await getPlayer(userId, playerNumber, gameId);

                socket.client.userId = userId;
                socket.client.playerDbId = player.id;

                logger.debug(`added player to db: ${player.id}`);
                callback(null, succeeded);

                this.instances[gameId].addPlayer(socket, !playerExists);
                this.instances[gameId].maybeStartGame();
            },
            timeout: 'none'
        });
    }

    gameExists(gameId) {
        return this.instances[gameId] != undefined;
    }

    gameIsFull(gameId) {
        return this.instances[gameId].isFull;
    }

    async createInstance(options) {
        const { instance, id } = await this.instanceQueue.getInstance();
        this.instances[id] = instance;

        instance.launch(() => {
            this.eventEmitter.emit('instanceStopped', id);
            delete this.instances[id];
        });

        // @TODO: consider injecting database dependency?
        if (options && options.practice) {
            const number = instance.serverEngine.getPlayerId({});
            const botUserId = await getBotUserId();
            getPlayer(botUserId, number, id).then((player) => {
                instance.serverEngine.createPlayer(player.id, number);
            });
        }
        return id;
    }

    onPlayerConnected(socket) {
        const id = socket.handshake.query.gameid;
        if (!id || !this.instances[id]) {
            throw new Error(`Socket does not have valid gameId param: ${id}`);
        } else if (this.instances[id].isFull) {
            throw new Error('Socket attempted to connect to full game');
        } else {
            this.instances[id].onPlayerConnected(socket);
        }
    }
}

/**
 * Can be adapted later if instances are moved to another process
 */
class InstanceQueue {
    constructor() {
        this.onDeck = this._createInstance();
    }

    /**
     * @private
     */
    async _createInstance() {
        const game = await createGame();
        const id = game.id;
        const instance = new Instance(id);
        return { instance, id };
    }

    async getInstance() {
        if (this.onDeck) {
            const val = this.onDeck;
            this.onDeck = null;
            return val;
        } else {
            return this._createInstance();
        }
    }
}
