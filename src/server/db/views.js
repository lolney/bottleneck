import models from './models';
import moment from 'moment';
import uuidv4 from 'uuid/v4';
//import TwoVector from 'lance/serialize/TwoVector';
// not sure why we can't import TwoVector here

/**
 * Contains
 */

export function date() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

function destructure(obj) {
    let dv = obj.dataValues;
    return {
        position: [dv.location.coordinates[0], dv.location.coordinates[1]],
        dbId: dv.id,
        objectType: dv.objectType
    };
}

/**
 * @returns all game objects
 */
export async function objects() {
    let raw = await models.gameObject.findAll();
    return raw.map((raw_elem) => destructure(raw_elem));
}

/**
 * @param {string} objId
 * @returns {object} The associated with object `objId`
 */
export async function problem(objId) {
    let obj = await models.gameObject.find({
        where: { id: objId },
        include: [models.problem]
    });
    return obj.problem;
}

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

export function createUser(username, password, email) {
    return models.user.create({
        username: username,
        password: password,
        email: email
    });
}
