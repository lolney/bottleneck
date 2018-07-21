import React from 'react';
import EditorModal from './EditorModal.jsx';
import PropTypes from 'prop-types';

/**
 * Handles socket interactions
 */
export default class SocketEditorContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            problem: null,
            code: ''
        };
        this.onSolution = this.onSolution.bind(this);

        this.props.socket.on('problem', (data) => {
            console.log('display', data);
            this.setState({ problem: data, code: data.code });
        });
    }

    onSolution(problemId, generator) {
        this.props.socket.emit('solution', {
            problemId: problemId,
            code: generator.toString()
        });
    }

    render() {
        if (this.state.problem)
            return (
                <EditorModal
                    key={this.state.code} // re-render on change
                    onSolution={this.onSolution}
                    problem={this.state.problem}
                    code={this.state.code}
                />
            );
        else return null;
    }
}

SocketEditorContainer.propTypes = {
    socket: PropTypes.object.isRequired
};
