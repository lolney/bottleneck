import Instance from './Instance';
import { checkPassword, getUserId } from './db/views/user';
import { setPlayerId } from './db/views/player';
import logger from './Logger';

export default class InstanceManager {
    constructor(io) {
        this.instances = {};
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

                console.log(socket.playerId);
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

    createInstance() {
        const id = Math.random();
        const instance = new Instance(() => {
            delete this.instances[id];
        });
        this.instances[id] = instance;
        instance.launch();
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
