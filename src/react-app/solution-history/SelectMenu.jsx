import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import '.././CSS/Solutions.scss';
import Problem from './Problem.jsx';
import Grid from './Grid.jsx';

import PropTypes from 'prop-types';

export default class SelectMenu extends React.Component {
    render() {
        return (
            <div className="solutions">
                <div className="fieldset">
                    <h1>Solution History</h1>
                    <input
                        type="search"
                        id="solutionSearch"
                        placeholder="Search for solutions.."
                    />
                </div>
                <div className="searchResults">
                    <div className="sidebar">
                        <div className="bootstrap-styles">
                            <ButtonToolbar>
                                {this.props.solvedProblems.map((solved) => (
                                    <SelectItem
                                        key={solved.problem.type}
                                        type={solved.problem.type}
                                    />
                                ))}
                            </ButtonToolbar>
                        </div>
                    </div>

                    <div className="solutions-container bootstrap-styles">
                        <Problem
                            problems={[
                                { name: 'Category?' },
                                { name: 'Subcategory 1' },
                                { name: 'Subcategory 2' },
                                { name: 'Subcategory 3' }
                            ]}
                        />

                        <Grid
                            problems={[{ name: 'hello' }, { name: 'goodbye' }]}
                        />
                    </div>

                    <p className="instructions" />
                </div>
            </div>
        );
    }
}

class SelectItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = SelectItem.getDerivedStateFromProps(props);
    }

    static getDerivedStateFromProps(props) {
        switch (props.type) {
        case 'btree':
            return {
                alt: 'tree icon',
                text: 'Binary Trees',
                src: 'assets/if_tree-1.png'
            };
        case 'image':
            return {
                alt: 'image icon',
                text: 'Image Matching',
                src: 'assets/image-icon.png'
            };
        default:
            throw new Error(`Unexpected type: ${props.type}`);
        }
    }

    render() {
        return (
            <Button>
                <div className="column">
                    <img
                        src={this.state.src}
                        alt={this.state.alt}
                        height="50"
                        width="50"
                    />
                </div>
                <h2 className="column">{this.state.text}</h2>
            </Button>
        );
    }
}

const subproblem = PropTypes.shape({
    type: PropTypes.string.isRequired
});

const problem = PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    subproblem: subproblem
});

const solvedProblem = PropTypes.shape({
    problem: problem.isRequired,
    code: PropTypes.string.isRequired
});

SelectMenu.propTypes = {
    solvedProblems: PropTypes.arrayOf(solvedProblem).isRequired
};
