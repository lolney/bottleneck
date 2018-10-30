import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
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
            this.setState({ status: State.Win });
        });
        this.props.socket.addEventListener('gameLose', (event) => {
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
                    <div className="text-container menuWindow">
                        <div className="victory-text">
                            {this.state.status}
                        </div>
                        <div className="bootstrap-styles">
                            <ButtonToolbar>
                                <Button className="menu-button">OK</Button>
                            </ButtonToolbar>
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
