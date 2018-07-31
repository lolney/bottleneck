import React from 'react';
import Editor from './Editor.jsx';
import ProblemComponent from './ProblemComponent.jsx';
import PropTypes from 'prop-types';

import './CSS/Modal.scss';

export default class EditorModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            generatorError: null,
            code: this.props.code,
            generator: eval(this.props.code)
        };
        this.setGenerator = this.setGenerator.bind(this);
        this.reportError = this.reportError.bind(this);
    }

    setGenerator(code) {
        try {
            let func = eval(code);
            if (!func) {
                throw new Error('Output is undefined');
            }
            if (typeof func != 'function')
                throw new Error('Must enter a function');
            this.setState({ generator: func, code: code });
        } catch (error) {
            this.setState({ generatorError: error });
        }
    }

    reportError(error) {
        this.setState({ generatorError: error });
    }

    render() {
        return (
            <div>
                {this.props.problem && (
                    <ProblemComponent
                        problem={this.props.problem}
                        generator={this.state.generator}
                        reportError={this.reportError}
                        onSolution={this.props.onSolution}
                    />
                )}
                <Editor
                    onChange={this.setGenerator}
                    value={this.state.code}
                    generatorError={this.state.generatorError}
                />
            </div>
        );
    }
}

EditorModal.propTypes = {
    onSolution: PropTypes.func.isRequired,
    problem: PropTypes.object,
    code: PropTypes.string.isRequired
};
