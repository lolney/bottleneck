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
            this.handlers = [];
            this.state = {
                props: { ...props },
                data: getInitialState(this.socket)
            };
        }

        /**
         * Reconcile state with new upstream props -
         * where props are new, as determined by the _nonce prop
         *
         * Note: cannot simply compare props with prev props,
         * since we may want to switch to using an upstream value
         * even if it's the same
         *
         * Also can't just prevent the component from updating
         * if we don't want the upstream value pushed, since
         * we may still want props to propagate through
         */
        static getDerivedStateFromProps(props, state) {
            const prevProps = state.props;
            if (prevProps._nonce != props._nonce) {
                const data = { ...state.data };
                for (const key of Object.keys(props)) {
                    if (data[key] != undefined) {
                        data[key] = props[key];
                    }
                }
                return { props: { ...props }, data };
            }
            return state;
        }

        componentDidMount() {
            for (const [event, handler] of handlers) {
                const modHandler = this.socket.on(event, (data) => {
                    this.setState({
                        data: {
                            ...this.state.data,
                            ...handler(data, this.state.data)
                        }
                    });
                });

                this.handlers.push([event, modHandler]);
            }
        }

        componentWillUnmount() {
            for (const [event, handler] of this.handlers) {
                this.socket.off(event, handler);
            }
        }

        render() {
            return <WrappedComponent {...this.props} {...this.state.data} />;
        }
    }
    WithSocket.contextType = SocketContext;
    return WithSocket;
}
