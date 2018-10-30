import PropTypes from 'prop-types';

export const subproblem = PropTypes.shape({
    type: PropTypes.string.isRequired
});

export const problem = PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    subproblem: subproblem
});

export const solvedProblem = PropTypes.shape({
    problem: problem.isRequired,
    code: PropTypes.string.isRequired
});

export const solvedProblems = PropTypes.arrayOf(solvedProblem).isRequired;
