import models from '../models';

export async function getUserId(username) {
    let obj = await models.user.find({
        where: { username: username },
        attributes: ['id']
    });
    if (!obj) {
        obj = await createUser(username);
    }
    return obj.dataValues.id;
}

export async function getBotUserId() {
    return getUserId('_botuser');
}

async function setGame(user, gameId) {
    let game = await models.game.findOne({ where: { id: gameId } });
    if (!game) {
        throw new Error('Tried to create guest for nonexistent game');
    }
    await user.setGame(game);
}

export async function createGuest(gameId) {
    let user = await models.user.findOne({
        where: { isIdle: true, isGuest: true, gameId }
    });
    if (user) {
        user = await user.update({ isIdle: false });
    } else {
        user = await models.user.create({
            isGuest: true
        });
    }

    await setGame(user, gameId);

    return user;
}

export function setGuestIdle(id) {
    return models.user.update({ isIdle: true }, { where: { id } });
}

export function createUser(username) {
    return models.user.create({
        username: username
    });
}
