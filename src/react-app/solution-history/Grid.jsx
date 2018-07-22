import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import '.././CSS/Solutions.scss';

export default class Grid extends React.Component {
    render() {
        return (
            <div className="bootstrap-styles">
                <div className="solution-grid">
                    {this.props.problems.map((problem) => (
                        <Button> {problem.name}</Button>
                    ))}
                </div>
            </div>
        );
    }
}

Grid.propTypes = {
    problems: PropTypes.object.isRequired
};
