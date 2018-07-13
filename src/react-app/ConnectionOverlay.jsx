import React from 'react';
import PropTypes from 'prop-types';

export default class ConnectionOverlay extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            connected: this.props.socket.readyState == 1
        };
        this.props.socket.addEventListener('open', (event) => {
            this.setState({ connected: true });
        });
        this.props.socket.addEventListener('close', (event) => {
            this.setState({ connected: false });
        });
        this.props.socket.addEventListener('authenticated', (event) => {
            this.setState({ connected: false });
        });
    }

    render() {
        if (this.state.connected) {
            return null;
        } else {
            return <div> Connecting </div>;
        }
    }
}
