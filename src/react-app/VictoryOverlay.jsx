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
        this.state = { status: State.Pending };
        this.props.socket.addEventListener('gameWin', (event) => {
            console.log('game won');
            this.setState({ status: State.Win });
        });
        this.props.socket.addEventListener('gameLose', (event) => {
            console.log('game lost');
            this.setState({ status: State.Lose });
        });
    }

    render() {
        switch (this.state.status) {
        case State.Pending:
            return null;
        default:
            return (
                <div className="victory-overlay">
                    <div className="text-container">
                        <div className="victory-text">
                            {this.state.status}
                        </div>
                    </div>
                </div>
            );
        }
    }
}

VictoryOverlay.propTypes = {
    socket: PropTypes.object.isRequired
};
