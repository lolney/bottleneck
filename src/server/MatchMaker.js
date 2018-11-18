import Instance from './Instance';
import logger from './Logger';
import { checkPassword, getUserId, setPlayerId } from './db';

const MAX_QUEUE_LENGTH = 2;

export default class MatchMaker {
    constructor(io) {
        this.reset();
        io.on('connection', this.onPlayerConnected.bind(this));
        this.handleAuth(io);
    }

    handleAuth(io) {
        require('socketio-auth')(io, {
            authenticate: async function(socket, data, callback) {
                let username = data.username;
                let password = data.password;

                logger.info(`User is logging in: ${data.username}`);
                let succeeded = await checkPassword(username, password);
                logger.info(`Authentication succeeded: ${succeeded}`);

                let userId = await getUserId(username);
                socket.client.userId = userId;

                logger.debug('got user id');

                let player = await setPlayerId(userId, socket.playerId);
                socket.client.playerDbId = player.id;

                logger.debug('added player to db');
                callback(null, succeeded);
            },
            timeout: 'none'
        });
    }

    reset() {
        this.queuedPlayers = [];
        if (this.instance) {
            this.instance.launch();
        }
        this.instance = new Instance();
    }

    finalize(instance) {
        logger.info('Enough players have joined. Starting the game.');
        for (const socket of this.queuedPlayers) {
            socket.removeListener('disconnect', socket.onPlayerDisconnected);
            socket.onPlayerDisconnected = null;
            // If waiting until this point to connect players,
            // must handle authentication differently.
            // this.instance.onPlayerConnected(socket);
        }
        // TODO: handle completed instance
        this.reset();
    }

    onPlayerDisconnected(index) {
        return () => this.queuedPlayers.splice(index, 1);
    }

    onPlayerConnected(socket) {
        let qp = this.queuedPlayers;

        if (qp.length < MAX_QUEUE_LENGTH) {
            let listener = this.onPlayerDisconnected(qp.length);
            socket.on('disconnect', listener);
            socket.onPlayerDisconnected = listener;
            this.queuedPlayers.push(socket);
            this.instance.onPlayerConnected(socket);
        } else {
            throw new Error('Too many players in queue: ', qp.length);
        }

        logger.info('Player joined the queue. Queue length: ', qp.length);
        if (qp.length == MAX_QUEUE_LENGTH) {
            this.finalize(this.instance);
        }
    }
}
