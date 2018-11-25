import SocketContext from './SocketContext';
import React from 'react';
import withSocket from './withSocket.jsx';

/**
 * Handles socket events with request-response pattern
 *
 * Backed by the Socket context, but can be replaced for testing by a socket prop.
 * @param {React.Component} WrappedComponent
 * @param {function} initialState - (socket) => state
 * @param {*} handlers - an array of event, handler pairs, where handler is a fn from data -> state, passed to withSocket
 */
export default function withSocketReq(
    WrappedComponent,
    handlers,
    getInitialState
) {
    class WithSocketReq extends React.Component {
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
            this.fetch = this.fetch.bind(this);
            this.state = {
                activeRequests: 0,
                data: getInitialState(this.socket)
            };
            this.Component = withSocket(WrappedComponent, handlers, () => {
                return this.state.data;
            });
        }

        shouldComponentUpdate(props, state) {
            console.log(
                'component is updating:',
                this.state,
                this.props,
                props,
                state
            );
            return true;
        }

        fetch(event, req) {
            this.socket.once(event, (resp) => {
                if (resp.type == 'SUCCESS') {
                    this.setState({
                        activeRequests: this.state.activeRequests - 1,
                        data: {
                            ...this.state.data,
                            ...resp.data,
                            _nonce: Math.random()
                        }
                    });
                } else {
                    console.error(
                        `Error while handling request ${event}: ${resp.msg}`
                    );
                    this.setState({
                        activeRequests: this.state.activeRequests - 1
                    });
                }
            });

            this.socket.emit(event, req);
            this.setState({ activeRequests: this.state.activeRequests + 1 });
        }

        render() {
            return (
                <this.Component
                    loading={this.state.activeRequests > 0}
                    fetch={this.fetch}
                    {...this.state.data}
                    {...this.props}
                />
            );
        }
    }
    WithSocketReq.contextType = SocketContext;
    return WithSocketReq;
}
