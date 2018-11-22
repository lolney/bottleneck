import models from '../models';
import { chainIncludes, getProblemSubTypes, getDataValues } from '..';

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

export async function getObjectResources(gameObjectId) {
    let obj = await models.gameObject.find({
        where: { id: gameObjectId }
    });
    return obj.getResources();
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

export async function markAsCollected(gameObjectId) {
    return await models.gameObject.update(
        { collected: true },
        { where: { id: gameObjectId } }
    );
}
