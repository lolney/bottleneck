import models from './models';
import moment from 'moment';
//import TwoVector from 'lance/serialize/TwoVector';
// not sure why we can't import TwoVector here

/**
 * This file contains a bunch of the equivalent of GraphQL resolvers,
 * Django views, or MVC controllers.
 */
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

export async function getProblemSubTypes(problem) {
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

export function getDataValues(obj) {
    let out = {};
    for (const [key, value] of Object.entries(obj.dataValues)) {
        if (Array.isArray(value)) out[key] = value.map((v) => getDataValues(v));
        else if (value && value.dataValues) out[key] = getDataValues(value);
        else out[key] = value;
    }
    return out;
}
