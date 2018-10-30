import SocketContext from './SocketContext';
import React from 'react';

/**
 * Higher-order component that handles simple interaction with the socket,
 * limited to receiving data from events
 *
 * Backed by the Socket context, but can be replaced for testing by a socket prop.
 * @param {React.Component} WrappedComponent
 * @param {*} handlers - an array of event, handler pairs, where handler is a fn from data -> state
 * @param {function} initialState - socket -> state
 */
export default function withSocket(
    WrappedComponent,
    handlers,
    getInitialState
) {
    class WithSocket extends React.Component {
        constructor(props) {
            super(props);
            if (this.context) {
                this.socket = this.context;
            } else if (this.props.socket) {
                this.socket = this.props.socket;
            } else {
                throw new Error(
                    'Socket hasn\'t been initialized, but tried creating component: ',
                    WrappedComponent
                );
            }
            this.state = {
                data: getInitialState(this.socket)
            };
        }

        componentDidMount() {
            for (const [event, handler] of handlers) {
                this.socket.on(event, (data) => {
                    this.setState({
                        data: {
                            ...this.state.data,
                            ...handler(data, this.state.data)
                        }
                    });
                });
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
    }
    WithSocket.contextType = SocketContext;
    return WithSocket;
}
