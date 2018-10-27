import React from 'react';
import PropTypes from 'prop-types';

const State = Object.freeze({
    Win: 'Victory!',
    Lose: 'You Lose!',
    Pending: 'Pending'
});

export default class VictoryOverlay extends React.Component {
    constructor(props) {
        super(props);
        this.state = { state: State.Pending };
        this.props.socket.addEventListener('gameWin', (event) => {
            console.log('game won');
            this.setState({ state: State.Win });
        });
        this.props.socket.addEventListener('gameLose', (event) => {
            console.log('game lost');
            this.setState({ state: State.Lose });
        });
    }

    render() {
        switch (this.state) {
        case State.Pending:
            return null;
        default:
            return (
                <div className="victory-overlay">
                    <div className="text-container">
                        <div className="victory-text">{this.state}</div>
                    </div>
                </div>
            );
        }
    }
}

VictoryOverlay.propTypes = {
    socket: PropTypes.object.isRequired
};
