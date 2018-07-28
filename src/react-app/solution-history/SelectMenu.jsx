import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import Problem from './Problem.jsx';
import PropTypes from 'prop-types';
import { solvedProblem } from './propTypes';

export default class SelectMenu extends React.Component {
    constructor(props) {
        super(props);

        this.checkIfSelected = this.checkIfSelected.bind(this);

        let types = Array.from(
            new Set(props.solvedProblems.map((solved) => solved.problem.type))
        );
        this.state = {
            selected: undefined,
            types: types
        };
    }

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
                                {this.state.types.map((type) => (
                                    <SelectItem
                                        onClick={() => {
                                            this.setState({
                                                selected:
                                                    this.state.selected == type
                                                        ? undefined
                                                        : type
                                            });
                                        }}
                                        active={this.state.selected == type}
                                        key={type}
                                        type={type}
                                    />
                                ))}
                            </ButtonToolbar>
                        </div>
                    </div>

                    <Problem
                        solvedProblems={this.props.solvedProblems.filter(
                            this.checkIfSelected
                        )}
                    />

                    <p className="instructions" />
                </div>
            </div>
        );
    }

    checkIfSelected(solved) {
        return this.state.selected == undefined
            ? solved
            : solved.problem.type == this.state.selected;
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
            <Button onClick={this.props.onClick} active={this.props.active}>
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

SelectMenu.propTypes = {
    solvedProblems: PropTypes.arrayOf(solvedProblem).isRequired
};
