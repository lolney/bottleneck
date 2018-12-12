import React from 'react';
import VisualTree from './VisualTree';
import { BinaryTree } from './VisualTree';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import '../CSS/BinaryTree.scss';
import '@fortawesome/fontawesome-free/css/all.css';
import { ProblemSubComponentTypes } from './PropTypes';

export default class BinaryTreeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...BinaryTreeComponent.getDerivedStateFromProps(props, {
                mySolutions: [],
                solved: []
            }),
            testCase: 0
        };
        this.getTestCase = this.getTestCase.bind(this);
    }

    getTestCase(index) {
        let i = index != undefined ? index : this.state.testCase;
        return {
            ...this.props.problem.testCases[i],
            mySolution: this.state.mySolutions[i]
        };
    }

    shouldComponentUpdate(props, state) {
        return (
            this.props.generator != props.generator ||
            this.state.testCase != state.testCase
        );
    }

    static checkSolutions(mySolutions, props) {
        return mySolutions.map((mySolution, i) => {
            let solution = props.problem.testCases[i].solution;
            return (
                solution.length == mySolution.length &&
                solution
                    .map((_, i) => mySolution[i] == solution[i])
                    .every((v) => v)
            );
        });
    }

    static runGenerator(props) {
        let wrapped = BinaryTree.wrapGenerator(props.generator);
        return props.problem.testCases.map((testCase) =>
            wrapped(testCase.tree)
        );
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate() {
        if (this.state.solved.every((v) => v)) {
            this.props.setDone(true);
        } else this.props.setDone(false);

        if (!this.state.error) this.props.reportError(null);
        else this.props.reportError(this.state.error);
    }

    static getDerivedStateFromProps(props, state) {
        try {
            let mySolutions = BinaryTreeComponent.runGenerator(props);
            let solvedArray = BinaryTreeComponent.checkSolutions(
                mySolutions,
                props
            );

            return {
                ...state,
                mySolutions: mySolutions,
                solved: solvedArray
            };
        } catch (error) {
            return { error: error, ...state };
        }
    }

    render() {
        const testCase = this.getTestCase();
        return (
            <div className="bTree">
                <section className="content">
                    <div className="canvas-row">
                        <TestIndicator
                            solvedArray={this.state.solved}
                            onSelect={(i) => {
                                this.setState({ testCase: i });
                            }}
                        />
                        <VisualTreeComponent
                            key={this.state.testCase}
                            nodes={testCase.tree}
                        />
                    </div>
                    <div className="array-row">
                        <p>Expected: {testCase.solution.toString()}</p>
                    </div>
                    <div className="array-row">
                        <p>Output: {testCase.mySolution.toString()}</p>
                    </div>
                </section>
            </div>
        );
    }
}

BinaryTreeComponent.propTypes = {
    ...ProblemSubComponentTypes,
    problem: PropTypes.shape({
        title: PropTypes.string,
        description: PropTypes.string,
        testCases: PropTypes.arrayOf(PropTypes.object)
    }).isRequired
};

export class VisualTreeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.id = 'treeCanvas' + Math.random();
    }

    componentDidMount() {
        const tree = BinaryTree.createTree(this.props.nodes);
        new VisualTree(tree, document.getElementById(this.id), false);
    }
    render() {
        return <canvas className="treeCanvas" id={this.id} />;
    }
}

class TestIndicator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selected: 0
        };
    }

    render() {
        return (
            <div className="buttonContainer bootstrap-styles">
                {this.props.solvedArray.map((solved, i) => (
                    <Button
                        className={solved ? 'passing' : 'failing'}
                        active={this.state.selected == i}
                        onClick={() => {
                            this.props.onSelect(i);
                            this.setState({ selected: i });
                        }}
                        key={i}
                    >
                        <span
                            className={
                                'fas ' + (solved ? 'fa-check' : 'fa-times')
                            }
                        />
                        {i}
                    </Button>
                ))}
            </div>
        );
    }
}
