import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Security, ImplicitCallback } from '@okta/okta-react';
import ModeSelect from './ModeSelect.jsx';
import Login from '../login/Login.jsx';

import config from '../login/config';

function customAuthHandler({ history }) {
    // Redirect to the /login page that has a CustomLoginComponent
    history.push('/login');
}

class App extends Component {
    render() {
        return (
            <Router>
                <Security
                    issuer={config.issuer}
                    client_id={config.client_id}
                    redirect_uri={config.redirect_uri}
                    onAuthRequired={customAuthHandler}
                >
                    <Route path="/" exact={true} component={ModeSelect} />
                    <Route
                        path="/implicit/callback"
                        component={ImplicitCallback}
                    />
                    <Route path="/login" component={Login} />
                </Security>
            </Router>
        );
    }
}

export default App;
