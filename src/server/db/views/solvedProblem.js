import models from '../models';
import { chainIncludes, getProblemSubTypes, getDataValues } from '..';

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
