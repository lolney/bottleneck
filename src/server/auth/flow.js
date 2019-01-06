import { getUserId, createGuest, setGuestIdle } from '../db/views/user';
import { getPlayer, doesPlayerExist } from '../db/views/player';
import logger from '../Logger';

import * as auth from './auth';

class AuthFlow {
    static async getPlayerId(socket, data, onPlayerConnected) {
        try {
            onPlayerConnected(socket);
            return { socket, req: data };
        } catch (error) {
            logger.error(`Error adding player to game: ${error}`);
            throw error;
        }
    }

    static async getUsername(data) {
        const { socket, req } = data;
        let token;
        let userId;
        let gameId = socket.handshake.query.gameid;
        let playerNumber = socket.playerId;

        try {
            token = await auth.verifyToken(req.token.i);
        } catch (error) {
            logger.info(`Invalid token: ${req.token.toString()}: ${error}`);
        }

        if (!token) {
            let user = await createGuest(gameId);
            userId = user.id;

            socket.on('disconnect', async () => setGuestIdle(userId));

            logger.info(`Creating guest user: ${userId}`);
        } else {
            let username = token.sub;

            userId = await getUserId(username);
            logger.info(`User is logging in: ${username}`);
        }

        return {
            userId,
            gameId,
            playerNumber,
            socket
        };
    }

    static async getPlayer(data) {
        const { userId, gameId, playerNumber } = data;

        let playerExists = await doesPlayerExist(userId, gameId);
        let player = await getPlayer(userId, playerNumber, gameId);

        return { playerExists, player, ...data };
    }

    static async setId(data) {
        const { socket, userId, player } = data;

        socket.client.userId = userId;
        socket.client.playerDbId = player.id;

        logger.debug(`added player to db: ${player.id}`);

        return data;
    }

    static async postAuth(data, instances) {
        const { gameId, socket, playerExists } = data;

        instances[gameId].addPlayer(socket, !playerExists);
        instances[gameId].maybeStartGame();
    }
}

AuthFlow.authRequired = auth.authRequired;

export default AuthFlow;
