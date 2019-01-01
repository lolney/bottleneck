import React from 'react';
import Editor from './Editor.jsx';
import ProblemComponent from './problems/ProblemComponent.jsx';
import PropTypes from 'prop-types';
import { withAlert } from 'react-alert';
import NewAlertTemplate, { alertOptions } from './common/TutorialAlerts';

import { Provider } from 'react-alert';
//import AlertTemplate from 'react-alert-template-basic';

import './CSS/Modal.scss';

class EditorModal extends React.Component {
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
                        alert={this.props.alert}
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

const wrapWithProvider = (ComponentClass) => {
    return (props) => (
        <Provider template={NewAlertTemplate} {...alertOptions}>
            <ComponentClass {...props} />
        </Provider>
    );
};

export default wrapWithProvider(withAlert(EditorModal));

EditorModal.propTypes = {
    onSolution: PropTypes.func.isRequired,
    problem: PropTypes.object,
    code: PropTypes.string.isRequired
};
