import models from '../models';

/**
 *
 * @param {string} username
 * @param {string} password - The raw password
 * @returns {boolean} `true` if the password is correct; else `false`
 */
export async function checkPassword(username, password) {
    let user = await models.user.find({ where: { username: username } });
    if (user) return user.validPassword(password);
    else return false;
}

export async function getUserId(username) {
    let obj = await models.user.find({
        where: { username: username },
        attributes: ['id']
    });
    return obj.dataValues.id;
}

export function createUser(username, password, email) {
    return models.user.create({
        username: username,
        password: password,
        email: email
    });
}
