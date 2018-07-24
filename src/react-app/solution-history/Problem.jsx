import React from 'react';
import PropTypes from 'prop-types';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import { solvedProblem } from './propTypes';
import Grid from './Grid.jsx';

export function bin(array) {
    let bins = {};
    for (const solvedProblem of array) {
        let subproblem = solvedProblem.problem.subproblem;
        let type = subproblem ? subproblem.type : 'none';

        if (bins[type]) {
            bins[type].push(solvedProblem);
        } else {
            bins[type] = [solvedProblem];
        }
    }
    return bins;
}

export default class Problem extends React.Component {
    render() {
        let subproblems = bin(this.props.solvedProblems);

        return (
            <div className="solutions-container bootstrap-styles">
                {!this.props.solvedProblems.every(
                    (solvedProblem) =>
                        solvedProblem.problem.subproblem == undefined
                ) && (
                    <DropdownButton
                        bsStyle="default"
                        bsSize="large"
                        title="hello"
                        id="dropdown-size-large"
                    >
                        {Object.keys(subproblems).map((subproblem) => (
                            <MenuItem eventKey="1" key={subproblem}>
                                {subproblem}
                            </MenuItem>
                        ))}
                    </DropdownButton>
                )}

                <Grid solvedProblems={this.props.solvedProblems} />
            </div>
        );
    }
}

Problem.propTypes = {
    solvedProblems: PropTypes.arrayOf(solvedProblem).isRequired
};
