import SocketContext from './SocketContext';
import React from 'react';

/**
 * Handles socket events with request-response pattern
 *
 * Backed by the Socket context, but can be replaced for testing by a socket prop.
 * @param {React.Component} WrappedComponent
 * @param {function} initialState - (socket) => state
 */
export default function withSocketReq(WrappedComponent, getInitialState) {
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
        }

        fetch(event, req) {
            this.socket.once(event, (resp) => {
                if (resp.type == 'SUCCESS') {
                    this.setState({
                        activeRequests: this.state.activeRequests - 1,
                        data: { ...this.state.data, ...resp.data }
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
                <WrappedComponent
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
