import React from 'react';
import Editor from './Editor.jsx';
import ProblemComponent from './problems/ProblemComponent.jsx';
import PropTypes from 'prop-types';
import { withAlert } from 'react-alert';
import NewAlertTemplate, { alertOptions } from './common/TutorialAlerts.jsx';

import { Provider } from 'react-alert';

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
            let generator = eval(code);
            if (generator != undefined) {
                this.setState({ generator, code: code });
            }
        } catch (error) {
            this.setState({ generatorError: error });
        }
    }

    reportError(error) {
        this.setState({ generatorError: error });
    }

    render() {
        return (
            <div className="editor-modal-dimensions">
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
    code: PropTypes.string.isRequired,
    alert: PropTypes.object.isRequired
};
