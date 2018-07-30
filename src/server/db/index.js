import models from './models';
import moment from 'moment';
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
        problemId: dv.problem.id,
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
    let raw = await models.gameObject.findAll({
        include: chainIncludes(
            models.problem,
            models.solvedProblem,
            models.user
        )
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

export function setPlayerId(userId, playerId) {
    return models.user.update(
        { playerId: playerId },
        { where: { id: userId } }
    );
}
