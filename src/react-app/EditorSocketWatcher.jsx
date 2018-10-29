import React from 'react';
import EditorModal from './EditorModal.jsx';
import PropTypes from 'prop-types';
import Windows from './Windows.jsx';
import { Provider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

const options = {
    timeout: 0,
    position: 'bottom center'
};

/**
 * Handles socket interactions
 * Keeps track of which problems are currently open, declining to add
 * them until the window has been closed.
 */
export default class EditorSocketWatcher {
    constructor(socket, addWindow) {
        this.socket = socket;
        this.addWindow = addWindow;
        this.openProblems = {};

        this.onSolution = this.onSolution.bind(this);

        socket.on('problem', this.receiveProblem.bind(this));

        socket.on('solvedProblem', this.receiveSolvedProblem.bind(this));
    }

    /**
     * @private
     */
    receiveProblem({ id, isSolved, problem, code }) {
        if (!this.openProblems[problem.id]) {
            this.addWindow(
                <Provider template={AlertTemplate} {...options}>
                    <EditorModal
                        onSolution={isSolved ? () => {} : this.onSolution}
                        problem={problem}
                        code={isSolved ? code : problem.code}
                    />
                </Provider>,
                id,
                () => delete this.openProblems[problem.id]
            );
        }
        this.openProblems[problem.id] = true;
    }

    /**
     * @private
     */
    receiveSolvedProblem({ problem, code }) {
        this.addWindow(
            <EditorModal onSolution={() => {}} problem={problem} code={code} />
        );
    }

    onSolution(problemId, generator) {
        this.socket.emit('solution', {
            problemId: problemId,
            code: generator.toString()
        });
    }
}
