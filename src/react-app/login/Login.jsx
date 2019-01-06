import React from 'react';
import PropTypes from 'prop-types';
import './config';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase';
import withRouter from 'react-router-dom/withRouter';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.uiConfig = {
            // Popup signin flow rather than redirect flow.
            signInFlow: 'popup',
            // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
            signInSuccessUrl: '/',
            callbacks: {
                signInSuccess: () => {
                    const state = this.props.history.location.state;
                    if (state && state.return) {
                        this.props.history.push(state.return);
                    } else {
                        this.props.history.push('/');
                    }
                }
            },
            // We will display Google and Facebook as auth providers.
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID
            ]
        };
    }

    render() {
        return (
            <div>
                <h1>Bottleneck</h1>
                <p>Please sign-in:</p>
                <StyledFirebaseAuth
                    uiConfig={this.uiConfig}
                    firebaseAuth={firebase.auth()}
                />
            </div>
        );
    }
}

Login.propTypes = {
    history: PropTypes.object.isRequired
};

export default withRouter(Login);
