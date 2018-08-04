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
            let solved = data.isSolved;
            let problem = data.problem;
            addWindow(
                <EditorModal
                    onSolution={solved ? () => {} : this.onSolution}
                    problem={problem}
                    code={solved ? data.code : problem.code}
                />,
                data.id
            );
        });

        socket.on('solvedProblem', (data) => {
            this.windows.current.addWindow(
                <EditorModal
                    onSolution={() => {}}
                    problem={data.problem}
                    code={data.code}
                />
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
