import React from 'react';
import VisualTree from './VisualTree';
import { BinaryTree } from './VisualTree';
import './CSS/BinaryTree.scss';
import '@fortawesome/fontawesome-free/css/all.css';

export default class BinaryTreeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            testCase: 0,
            mySolutions: this.props.problem.testCases.map(() => []),
            solved: this.props.problem.testCases.map(() => false)
        };
        this.getTestCase = this.getTestCase.bind(this);
        this.checkSolutions = this.checkSolutions.bind(this);
    }

    getTestCase(index) {
        let i = index != undefined ? index : this.state.testCase;
        return {
            ...this.props.problem.testCases[i],
            mySolution: this.state.mySolutions[i]
        };
    }

    checkSolutions(mySolutions) {
        return mySolutions.map((mySolution, i) => {
            let solution = this.getTestCase(i).solution;
            return (
                solution.length == mySolution.length &&
                solution
                    .map((_, i) => mySolution[i] == solution[i])
                    .every((v) => v)
            );
        });
    }

    runGenerator(generator) {
        let wrapped = BinaryTree.wrapGenerator(this.props.generator);
        return this.props.problem.testCases.map((testCase) =>
            wrapped(testCase.tree)
        );
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.generator != prevProps.generator) {
            try {
                let mySolutions = this.runGenerator(this.props.generator);
                let solvedArray = this.checkSolutions(mySolutions);

                if (solvedArray.every((v) => v)) this.props.setDone(true);
                else this.props.setDone(false);

                this.setState({
                    mySolutions: mySolutions,
                    solved: solvedArray
                });
                this.props.reportError(null);
            } catch (error) {
                this.props.reportError(error);
            }
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

export class VisualTreeComponent extends React.Component {
    componentDidMount() {
        const tree = BinaryTree.createTree(this.props.nodes);
        new VisualTree(tree, document.getElementById('treeCanvas'), false);
    }
    render() {
        return <canvas className="treeCanvas" id="treeCanvas" />;
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
            <div className="buttonContainer">
                {this.props.solvedArray.map((solved, i) => (
                    <button
                        className={solved ? 'passing' : 'failing'}
                        active={(this.state.selected == i).toString()}
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
                    </button>
                ))}
            </div>
        );
    }
}
