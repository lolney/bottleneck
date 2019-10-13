import BinaryTreeProblem from './BinaryTreeProblem';
import ImageProblem from './ImageProblem';
import RegexProblem from './RegexProblem';
import { problemTypes } from '../constants';

export default class ProblemGenerator {
    static serialize(problem) {
        return ProblemGenerator.fromDB(problem).serialize();
    }

    static fromDB(problem) {
        switch (problem.type) {
        case problemTypes.BTREE:
            return new BinaryTreeProblem(problem.id);
        case problemTypes.IMAGE:
            return new ImageProblem(
                problem.subproblem.original,
                problem.id
            );
        case problemTypes.REGEX:
            return new RegexProblem(problem.subproblem.regex, problem.id);
        default:
            throw new TypeError(`Unexpected type: ${problem.type}`);
        }
    }
}
