import React from 'react';
import EditorModal from './EditorModal.jsx';
import PropTypes from 'prop-types';
import Windows from './Windows.jsx';

/**
 * Handles socket interactions
 * Keeps track of which problems are currently open, declining to add
 * them until the window has been closed.
 */
export default class EditorSocketWatcher {
    constructor(socket, addWindow) {
        this.socket = socket;
        this.openProblems = {};

        this.onSolution = this.onSolution.bind(this);

        socket.on('problem', (data) => {
            let solved = data.isSolved;
            let problem = data.problem;

            if (!this.openProblems[problem.id]) {
                addWindow(
                    <EditorModal
                        onSolution={solved ? () => {} : this.onSolution}
                        problem={problem}
                        code={solved ? data.code : problem.code}
                    />,
                    data.id,
                    () => delete this.openProblems[problem.id]
                );
            }
            this.openProblems[problem.id] = true;
        });

        socket.on('solvedProblem', (data) => {
            addWindow(
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