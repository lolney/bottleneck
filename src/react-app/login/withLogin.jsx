import React from 'react';
import { AuthUserContext } from './config.js';
import firebase from 'firebase';

const withLogin = (Component) =>
    class App extends React.Component {
        render() {
            return (
                <AuthUserContext.Provider value={firebase}>
                    <Component />
                </AuthUserContext.Provider>
            );
        }
    };

export default withLogin;
