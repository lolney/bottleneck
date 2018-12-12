import React from 'react';
import SelectMenu from '../common/SelectMenu.jsx';
import Problem from './Problem.jsx';
import buttonConfig from './buttonConfig';
import { solvedProblems } from './propTypes';
import withSocket from '../withSocket.jsx';
import PropTypes from 'prop-types';

class SolutionHistory extends React.Component {
    render() {
        return (
            <div className="solutions">
                <div className="header">
                    <h1>Solution History</h1>
                    <input
                        type="search"
                        id="solutionSearch"
                        placeholder="Search for solutions.."
                    />
                </div>

                <SelectMenu
                    key={this.props.solvedProblems.length}
                    data={this.props.solvedProblems}
                    getType={(solved) => solved.problem.type}
                    buttonConfig={buttonConfig}
                >
                    <Problem data={[]} openWindow={this.props.openWindow} />
                </SelectMenu>
            </div>
        );
    }
}

SolutionHistory.propTypes = {
    solvedProblems: solvedProblems,
    openWindow: PropTypes.func.isRequired
};

export default withSocket(
    SolutionHistory,
    [
        [
            'solvedProblems',
            (data) => ({
                solvedProblems: data
            })
        ]
    ],
    (socket) => {
        socket.emit('solvedProblems');
        return { solvedProblems: [] };
    }
);
