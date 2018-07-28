import React from 'react';
import EditorModal from './EditorModal.jsx';
import PropTypes from 'prop-types';
import Windows from './Windows.jsx';

/**
 * Handles socket interactions
 */
export default class EditorSocketWatcher {
    constructor(socket, addWindow) {
        this.socket = socket;

        this.onSolution = this.onSolution.bind(this);
        socket.on('problem', (data) => {
            addWindow(
                <EditorModal
                    key={data.code} // re-render on change
                    onSolution={this.onSolution}
                    problem={data}
                    code={data.code}
                />,
                data.id
            );
        });
    }

    onSolution(problemId, generator) {
        this.socket.emit('solution', {
            problemId: problemId,
            code: generator.toString()
        });
    }
}
