import React from 'react';
import '.././CSS/Solutions.scss';
import SelectMenu from './SelectMenu.jsx';
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
            <SelectMenu
                key={this.state.solvedProblems.length}
                solvedProblems={this.state.solvedProblems}
                openWindow={this.props.openWindow}
            />
        );
    }
}

SolutionHistory.propTypes = {
    socket: PropTypes.object.isRequired,
    openWindow: PropTypes.func.isRequired
};
