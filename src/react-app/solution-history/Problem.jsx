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
    constructor(props) {
        super(props);

        this.checkIfSelected = this.checkIfSelected.bind(this);

        this.state = Problem.getDerivedStateFromProps(props, {});
    }

    static getDerivedStateFromProps(props, state) {
        let subproblems = bin(props.solvedProblems);
        let keys = Object.keys(subproblems);

        if (state.selected != undefined && keys.includes(state.selected)) {
            var selected = state.selected;
        } else {
            var selected = keys.length > 0 ? keys[0] : undefined;
        }

        return {
            selected: selected,
            subproblems: subproblems
        };
    }

    render() {
        return (
            <div className="solutions-container bootstrap-styles">
                {!this.props.solvedProblems.every(
                    (solvedProblem) =>
                        solvedProblem.problem.subproblem == undefined
                ) && (
                    <DropdownButton
                        bsStyle="default"
                        bsSize="large"
                        title={`Subproblem: ${this.state.selected}`}
                        id="dropdown-size-large"
                    >
                        {Object.keys(this.state.subproblems).map(
                            (subproblem) => (
                                <MenuItem
                                    onClick={() => {
                                        this.setState({
                                            selected: subproblem
                                        });
                                    }}
                                    active={this.state.selected == subproblem}
                                    key={subproblem}
                                >
                                    {subproblem}
                                </MenuItem>
                            )
                        )}
                    </DropdownButton>
                )}

                <Grid
                    solvedProblems={this.props.solvedProblems.filter(
                        this.checkIfSelected
                    )}
                />
            </div>
        );
    }

    checkIfSelected(solved) {
        let subproblem = solved.problem.subproblem;
        if (this.state.selected == 'none') {
            return undefined == subproblem;
        } else {
            if (subproblem == undefined) {
                return false;
            } else {
                return this.state.selected == subproblem.type;
            }
        }
    }
}

Problem.propTypes = {
    solvedProblems: PropTypes.arrayOf(solvedProblem).isRequired
};
