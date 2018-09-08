import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { solvedProblem } from './propTypes';

export default class Grid extends React.Component {
    render() {
        return (
            <div className="bootstrap-styles">
                <div className="solution-grid">
                    {this.props.solvedProblems.map((solved) => (
                        <Button
                            className="menu-button"
                            key={solved.problem.name}
                            onClick={() =>
                                this.props.openWindow(solved.code, solved.id)
                            }
                        >
                            {solved.problem.name}
                        </Button>
                    ))}
                </div>
            </div>
        );
    }
}

Grid.propTypes = {
    solvedProblems: PropTypes.arrayOf(solvedProblem).isRequired,
    openWindow: PropTypes.func.isRequired
};
