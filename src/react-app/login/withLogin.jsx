import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Security, ImplicitCallback } from '@okta/okta-react';
import Login from '../login/Login.jsx';

import config from '../login/config';

function customAuthHandler({ history }) {
    // Redirect to the /login page that has a CustomLoginComponent
    history.push('/login');
}

const withLogin = (Component, root) =>
    class App extends React.Component {
        render() {
            return (
                <Router>
                    <Security
                        issuer={config.issuer}
                        client_id={config.client_id}
                        redirect_uri={config.redirect_uri}
                        onAuthRequired={customAuthHandler}
                    >
                        <Route path={root} exact={true} component={Component} />
                        <Route
                            path="/implicit/callback"
                            component={ImplicitCallback}
                        />
                        <Route path="/login" component={Login} />
                    </Security>
                </Router>
            );
        }
    };

export default withLogin;
