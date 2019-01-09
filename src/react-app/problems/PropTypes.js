import PropTypes from 'prop-types';

/**
 * Children of ProblemComponent must implement this prop interface
 */
export const ProblemSubComponentTypes = {
    generator: PropTypes.any.isRequired,
    setDone: PropTypes.func.isRequired,
    reportError: PropTypes.func.isRequired,
    problem: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string
    }).isRequired
};
