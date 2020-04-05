import React from 'react';
import PropTypes from 'prop-types';
import './config';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import firebase from 'firebase/app';
import 'firebase/auth';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.uiConfig = {
            signInFlow: 'popup',
            signInSuccessUrl: '/',
            callbacks: {
                signInSuccess: this.props.onSuccess,
            },
            credentialHelper: 'none',
            signInOptions: [
                firebase.auth.GoogleAuthProvider.PROVIDER_ID,
                firebase.auth.EmailAuthProvider.PROVIDER_ID,
            ],
        };
    }

    render() {
        return (
            <div>
                <p>Select a method to sign in:</p>
                <StyledFirebaseAuth
                    uiConfig={this.uiConfig}
                    firebaseAuth={firebase.auth()}
                />
            </div>
        );
    }
}

Login.propTypes = {
    onSuccess: PropTypes.func.isRequired,
};

export default Login;
