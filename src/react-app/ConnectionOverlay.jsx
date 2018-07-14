import React from 'react';
import PropTypes from 'prop-types';

const State = Object.freeze({
    Connected: Symbol('connected'),
    Connecting: Symbol('connecting'),
    Loading: Symbol('loading')
});

export default class ConnectionOverlay extends React.Component {
    constructor(props) {
        super(props);
        if (this.props.socket) {
            this.state = {
                state:
                    this.props.socket.readyState == 1
                        ? State.Connected
                        : State.Connecting
            };
            this.props.socket.addEventListener('open', (event) => {
                this.setState({ state: State.Connected });
            });
            this.props.socket.addEventListener('close', (event) => {
                this.setState({ state: State.Connecting });
            });
        } else {
            this.state = { state: State.Loading };
        }
    }

    render() {
        switch (this.state.state) {
            case State.Connected:
                return null;
            case State.Connecting:
                return <div> Connecting </div>;
            case State.Loading:
                return <div> Loading </div>;
        }
    }
}
