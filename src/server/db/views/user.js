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

export async function createGuest() {
    return models.user.create({
        isGuest: true
    });
}

export function createUser(username) {
    return models.user.create({
        username: username
    });
}
