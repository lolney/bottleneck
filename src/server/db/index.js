import models from './models';
import db from './models';
import moment from 'moment';
import { assaultBot, playerBase } from '../../config';
//import TwoVector from 'lance/serialize/TwoVector';
// not sure why we can't import TwoVector here

export function date() {
    return moment().format('YYYY-MM-DD HH:mm:ss');
}

export function chainIncludes(...args) {
    if (args.length == 1) {
        return [args[0]];
    } else if (args.length == 0) {
        return [];
    } else {
        let child = chainIncludes(...args.slice(1));
        return [{ include: child, model: args[0] }];
    }
}

function getDataValues(obj) {
    let out = {};
    for (const [key, value] of Object.entries(obj.dataValues)) {
        if (Array.isArray(value)) out[key] = value.map((v) => getDataValues(v));
        else if (value && value.dataValues) out[key] = getDataValues(value);
        else out[key] = value;
    }
    return out;
}

function formatObject(obj) {
    let dv = getDataValues(obj);
    return {
        position: [dv.location.coordinates[0], dv.location.coordinates[1]],
        dbId: dv.id,
        objectType: dv.objectType,
        behaviorType: dv.behaviorType,
        problemId: dv.problem.id,
        resources: dv.resources,
        collected: dv.collected,
        solvedBy: dv.problem.solvedProblem
            ? dv.problem.solvedProblem.user.playerId
            : null
    };
}

async function getProblemSubTypes(problem) {
    let subtype = problem.type;
    if (models[subtype]) {
        // Do subtypes exist in general?
        let subproblem = await models[subtype].find({
            where: { id: problem.id }
        });
        // Does a subtype exist for this problem?
        if (subproblem) {
            subproblem = await getProblemSubTypes(subproblem.dataValues);
            problem.subproblem = subproblem;
        }
    }
    return problem;
}

/**
 * @returns all game objects, including the user ID of any user that has solved it
 */
export async function objects() {
    let includes = chainIncludes(
        models.problem,
        models.solvedProblem,
        models.user
    );
    includes.push({ model: models.resource });

    let raw = await models.gameObject.findAll({
        include: includes
    });
    return raw.map((raw_elem) => formatObject(raw_elem));
}

/**
 * @param {string} objId
 * @param {string} userId - optional: includes
 * @returns {object} - Problem and metadata
 * @property {object.problem} - The problem associated with object `objId`
 */
export async function problem(objId, userId) {
    let obj = await models.gameObject.find({
        where: { id: objId },
        include: [
            {
                model: models.problem,
                include: [
                    {
                        model: models.solvedProblem,
                        where: { userId: userId },
                        required: false
                    }
                ]
            }
        ]
    });

    let problem = await getProblemSubTypes(obj.problem.dataValues);
    let solvedProblems = obj.problem.dataValues.solvedProblems;
    let isSolved = solvedProblems.length > 0 ? true : false;
    let base = { problem: problem, isSolved: isSolved };

    return isSolved
        ? { ...base, code: solvedProblems[0].dataValues.code }
        : base;
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

export function addSolution(userId, problemId, code) {
    return models.solvedProblem.create({
        code: code,
        userId: userId,
        problemId: problemId
    });
}

export async function getSolutions(userId) {
    let obj = await models.user.find({
        where: { id: userId },
        include: chainIncludes(models.solvedProblem, models.problem)
    });
    let solvedProblems = obj.solvedProblems.map((s) => getDataValues(s));
    return await Promise.all(
        solvedProblems.map(async (solved) => {
            let problem = await getProblemSubTypes(solved.problem);
            return { ...solved, problem: problem };
        })
    );
}

export async function solvedProblem(id) {
    let obj = await models.solvedProblem.find({
        where: { id: id },
        include: [models.problem]
    });
    let solved = getDataValues(obj);
    let problem = await getProblemSubTypes(solved.problem);
    return { ...solved, problem: problem };
}

export async function getUserId(username) {
    let obj = await models.user.find({
        where: { username: username },
        attributes: ['id']
    });
    return obj.dataValues.id;
}

/**
 * Cteates player with the provided number and associates it with user,
 * returning the newly-created player
 * @param {*} userId
 * @param {*} number
 * @param {TwoVector} location
 * @returns {*} - the player
 */
export async function setPlayerId(userId, number, location) {
    let sequelizeLocation = !location
        ? null
        : db.Sequelize.fn(
            'ST_GeomFromText',
            `POINT(${location.x} ${location.y})`
        );
    let player = await models.player.create({
        playerNumber: Number(number),
        location: sequelizeLocation
    });
    let user = await models.user.find({ where: { id: userId } });

    let base = await models.base.create({
        location: sequelizeLocation,
        hp: playerBase.baseHP
    });
    let stone = await models.resource.create({
        parent: 'player',
        name: 'stone',
        count: 10
    });
    let wood = await models.resource.create({
        parent: 'player',
        name: 'wood',
        count: 10
    });
    await Promise.all([
        player.setUser(user),
        player.setBase(base),
        await wood.setPlayer(player),
        await stone.setPlayer(player)
    ]);

    return player;
}

export async function getPlayerResources(playerId) {
    let player = await models.player.find({ where: { id: playerId } });
    return player.getResources();
}

export async function deletePlayerId(userId, playerId) {}

export async function getObjectResources(gameObjectId) {
    let obj = await models.gameObject.find({
        where: { id: gameObjectId }
    });
    return obj.getResources();
}

/**
 * Add `count` to the current resource count for player `playerId`
 * @returns {Number} - the new resource count
 */
export async function addToResourceCount(playerId, resourceName, count) {
    // playerResource of id resourceId associated with player
    let raw = await models.player.find({
        where: { id: playerId },
        include: [
            {
                model: models.resource,
                where: { name: resourceName }
            }
        ]
    });
    let obj = getDataValues(raw);
    let resource = obj.resources[0];
    let newCount = resource.count + count;
    if (newCount < 0) {
        throw new Error(`Resource count would be negative: ${newCount}`);
    }
    await models.resource.update(
        { count: newCount },
        { where: { id: resource.id } }
    );
    return newCount;
}

export async function markAsCollected(gameObjectId) {
    return await models.gameObject.update(
        { collected: true },
        { where: { id: gameObjectId } }
    );
}

/**
 * Decrement player base HP by the amount that an assault bot deducts
 * @param {number} playerNumber
 * @returns {number} The updated HP
 */
export async function decrementHP(playerId) {
    let player = await models.player.find({
        where: { id: playerId }
    });
    let base = await player.getBase();
    let hp = base.hp - assaultBot.damage;
    if (hp < 0) {
        hp = 0;
    }
    await models.base.update({ hp: hp }, { where: { id: base.id } });
    return hp;
}
