import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from '../login/Login.jsx';
import { AuthUserContext } from './config.js';
import firebase from 'firebase';

const withLogin = (Component, root) =>
    class App extends React.Component {
        render() {
            return (
                <AuthUserContext.Provider value={firebase}>
                    <Router>
                        <Fragment>
                            <Route
                                path={root}
                                exact={true}
                                component={Component}
                            />
                            <Route path="/login" component={Login} />
                        </Fragment>
                    </Router>
                </AuthUserContext.Provider>
            );
        }
    };

export default withLogin;
