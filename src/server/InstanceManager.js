import Instance from './Instance';
import { getBotUserId } from './db/views/user';
import { createGame } from './db/views/game';
import { getPlayer } from './db/views/player';
import socketioAuth from 'socketio-auth';
import { EventEmitter } from 'events';
import logger from './Logger';

export default class InstanceManager {
    constructor(io, Auth) {
        this.instances = {};
        this.instanceQueue = new InstanceQueue();
        this.eventEmitter = new EventEmitter();

        if (io) {
            this.handleAuth(io, Auth);
        }
    }

    handleAuth(io, Auth) {
        const onPlayerConnected = this.onPlayerConnected.bind(this);
        socketioAuth(io, {
            authenticate: async (socket, data, callback) => {
                Auth.getPlayerId(socket, data, onPlayerConnected)
                    .then(Auth.getUsername)
                    .then(Auth.getPlayer)
                    .then(Auth.setId)
                    .then(async (data) => {
                        callback(null, true);
                        return data;
                    })
                    .then(async (data) => Auth.postAuth(data, this.instances))
                    .catch((err) => {
                        logger.warning(`Auth failed: ${err}`);
                        callback(null, false);
                    });
            },
            timeout: 5000
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
