import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { solvedProblem } from './propTypes';

const IS_EMPTY_STRING =
    'Nothing here. Come back when you\'ve solved some problems.';

export default class Grid extends React.Component {
    createButton(solved) {
        return (
            <Button
                className="menu-button"
                key={solved.problem.name}
                onClick={() => this.props.openWindow(solved.code, solved.id)}
            >
                {solved.problem.name}
            </Button>
        );
    }
    render() {
        return (
            <div className="bootstrap-styles">
                <div className="solution-grid">
                    {this.props.solvedProblems.length > 0 ? (
                        this.props.solvedProblems.map(
                            this.createButton.bind(this)
                        )
                    ) : (
                        <p>{IS_EMPTY_STRING}</p>
                    )}
                </div>
            </div>
        );
    }
}

Grid.propTypes = {
    solvedProblems: PropTypes.arrayOf(solvedProblem).isRequired,
    openWindow: PropTypes.func.isRequired
};
