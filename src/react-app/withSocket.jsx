import Socket from './socket';
import React from 'react';

/**
 * Higher-order component that handles simple interaction with the socket,
 * limited to receiving data from events
 *
 * Backed by the Socket singleton, but can be replaced for testing by a socket prop.
 * @param {React.Component} WrappedComponent
 * @param {*} handlers - an array of event, handler pairs, where handler is a fn from data -> state
 * @param {function} initialState - socket -> state
 */
export default function withSocket(
    WrappedComponent,
    handlers,
    getInitialState
) {
    return class extends React.Component {
        constructor(props) {
            super(props);
            this.socket = this.props.socket ? this.props.socket : Socket;
            this.state = {
                data: getInitialState(this.socket)
            };
        }

        componentDidMount() {
            if (!this.socket.connected) {
                throw new Error(
                    'Socket hasn\'t been initialized, but tried creating component: ',
                    WrappedComponent
                );
            }
            for (const [event, handler] of handlers) {
                this.socket.on(event, (data) =>
                    this.setState({
                        data: { ...this.state.data, ...handler(data) }
                    })
                );
            }
        }

        componentWillUnmount() {
            for (const [event, handler] of handlers) {
                this.socket.removeListener(event, handler);
            }
        }

        render() {
            return <WrappedComponent {...this.state.data} {...this.props} />;
        }
    };
}
