import React from 'react';
import SelectMenu from '../common/SelectMenu.jsx';
import Problem from './Problem.jsx';
import buttonConfig from './buttonConfig';
import PropTypes from 'prop-types';

export default class SolutionHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            solvedProblems: []
        };
        this.props.socket.emit('solvedProblems');
        this.props.socket.on('solvedProblems', (data) => {
            this.setState({ solvedProblems: data });
        });
    }

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
                    key={this.state.solvedProblems.length}
                    data={this.state.solvedProblems}
                    getType={(solved) => solved.problem.type}
                    buttonConfig={buttonConfig}
                >
                    <Problem openWindow={this.props.openWindow} />
                </SelectMenu>
            </div>
        );
    }
}

SolutionHistory.propTypes = {
    socket: PropTypes.object.isRequired,
    openWindow: PropTypes.func.isRequired
};
