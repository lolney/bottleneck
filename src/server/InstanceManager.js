import Instance from './Instance';
import { checkPassword, getUserId } from './db/views/user';
import { setPlayerId } from './db/views/player';
import logger from './Logger';

export default class InstanceManager {
    constructor(io) {
        this.instances = {};
        this.instanceQueue = new InstanceQueue();

        if (io) {
            io.on('connection', this.onPlayerConnected.bind(this));
            this.handleAuth(io);
        }
    }

    static async addPlayer(username, playerNumber) {
        let userId = await getUserId(username);
        let player = await setPlayerId(userId, playerNumber);
        return { userId, player };
    }

    handleAuth(io) {
        require('socketio-auth')(io, {
            authenticate: async function(socket, data, callback) {
                let username = data.username;
                let password = data.password;

                logger.info(`User is logging in: ${data.username}`);
                let succeeded = await checkPassword(username, password);
                logger.info(`Authentication succeeded: ${succeeded}`);

                let { userId, player } = await InstanceManager.addPlayer(
                    username,
                    socket.playerId
                );
                socket.client.userId = userId;
                socket.client.playerDbId = player.id;

                logger.debug(`added player to db: ${player.id}`);
                callback(null, succeeded);
            },
            timeout: 'none'
        });
    }

    async createInstance(options) {
        const { instance, id } = await this.instanceQueue.getInstance();
        this.instances[id] = instance;
        instance.launch(() => {
            delete this.instances[id];
        });

        // @TODO: consider injecting database dependency?
        if (options && options.practice) {
            const number = instance.serverEngine.getPlayerId({});
            InstanceManager.addPlayer('_botuser', number).then(({ player }) => {
                instance.serverEngine.createPlayer(player.id, number);
            });
        }
        return id;
    }

    onPlayerConnected(socket) {
        const id = socket.handshake.query.gameid;
        if (!id || !this.instances[id]) {
            logger.error(`Socket does not have valid gameId param: ${id}`);
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
    _createInstance() {
        const id = Math.random();
        const instance = new Instance();
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
