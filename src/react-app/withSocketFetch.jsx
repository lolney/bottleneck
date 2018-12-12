import SocketContext from './SocketContext';
import React from 'react';
import withSocket from './withSocket.jsx';

/**
 * Includes the functionality of withSocket, but also fetches an initial state,
 * passing the loading: true prop while it does.
 *
 * Backed by the Socket context, but can be replaced for testing by a socket prop.
 * @param {React.Component} WrappedComponent
 * @param {*} handlers - an array of event, handler pairs, where handler is a fn from data -> state
 * @param {function} initialState - socket -> state
 */
export default function withSocketFetch(
    WrappedComponent,
    handlers,
    initialStateHandlers
) {
    class WithSocketFetch extends React.Component {
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
                loading: true
            };
        }

        async componentDidMount() {
            let results = await Promise.all(
                initialStateHandlers.map(([event, handler]) =>
                    this.getInitial(event, handler)
                )
            );
            for (const data of results) {
                this.setState({
                    data: { ...this.state.data, ...data }
                });
            }
            this.setState({ loading: false });
        }

        getInitial(event, handler) {
            this.socket.emit(event);
            return new Promise((resolve, reject) => {
                this.socket.once(event, (data) => {
                    resolve(handler(data));
                });
            });
        }

        render() {
            if (this.state.loading) {
                return <WrappedComponent loading={true} {...this.props} />;
            } else {
                let Component = withSocket(WrappedComponent, handlers, () => {
                    return this.state.data;
                });
                return <Component loading={false} {...this.props} />;
            }
        }
    }
    WithSocketFetch.contextType = SocketContext;
    return WithSocketFetch;
}
