import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import '.././CSS/Solutions.scss';
import { solvedProblem } from './SelectMenu.jsx';

export default class Grid extends React.Component {
    render() {
        return (
            <div className="bootstrap-styles">
                <div className="solution-grid">
                    {this.props.solvedProblems.map((solved) => (
                        <Button eventKey="1" key={solved.problem.name}>
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
