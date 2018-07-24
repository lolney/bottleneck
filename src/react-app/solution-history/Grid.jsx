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
                        <Button key={solved.problem.name}>
                            {solved.problem.name}
                        </Button>
                    ))}
                </div>
            </div>
        );
    }
}

Grid.propTypes = {
    solvedProblems: PropTypes.arrayOf(solvedProblem).isRequired
};
