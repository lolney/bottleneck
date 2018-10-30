import React from 'react';
import PropTypes from 'prop-types';

const State = Object.freeze({
    Connected: 'connected',
    Connecting: 'connecting',
    Loading: 'loading',
    Authenticating: 'authenticating'
});

export default class ConnectionOverlay extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.socket) {
            this.state = {
                authenticated: false,
                state: this.props.socket.connected
                    ? State.Connected
                    : State.Connecting
            };
            this.props.socket.addEventListener('connect', (event) => {
                console.log('connected');
                if (this.state.authenticated)
                    this.setState({ state: State.Connected });
                else this.setState({ state: State.Authenticating });
            });
            this.props.socket.addEventListener('disconnect', (event) => {
                console.log('disconnected');
                this.setState({
                    state: State.Connecting,
                    authenticated: false
                });
            });
            this.props.socket.addEventListener('authenticated', (event) => {
                console.log('authenticated');
                this.setState({ state: State.Connected, authenticated: true });
            });
        } else {
            this.state = { state: State.Loading };
        }
    }

    render() {
        switch (this.state.state) {
        case State.Connected:
            return null;
        default:
            return (
                <div className="loading-screen">
                    <div id="spinner" className="spinner">
                        <div className="loader-wrapper">
                            <div className="loader" />
                        </div>
                        <div className="text-container">
                            <div className="loading-text">
                                {this.state.state}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
    }
}
