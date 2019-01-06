import React from 'react';
import { AuthUserContext } from './config';
import firebase from 'firebase';

const GUEST_USER = { displayName: 'Guest' };

const withAuth = (Component) => {
    class AuthComponent extends React.Component {
        constructor(props) {
            super(props);

            this.state = {
                authenticated: false,
                user: null
            };
        }

        componentDidMount() {
            this.unregisterAuthObserver = firebase
                .auth()
                .onAuthStateChanged((user) =>
                    this.setState({
                        authenticated: !!user,
                        user: user ? user : GUEST_USER
                    })
                );
        }

        // Make sure we un-register Firebase observers when the component unmounts.
        componentWillUnmount() {
            this.unregisterAuthObserver();
        }

        render() {
            return (
                <Component
                    {...this.props}
                    user={this.state.user}
                    authenticated={this.state.authenticated}
                    firebase={firebase}
                />
            );
        }
    }

    AuthComponent.contextType = AuthUserContext;

    return AuthComponent;
};

export default withAuth;
