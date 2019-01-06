import React from 'react';
import { AuthUserContext } from './config';

const withAuth = (Component) =>
    class AuthComponent extends React.Component {
        render() {
            return (
                <AuthUserContext.Consumer>
                    {(firebase) => (
                        <Component {...this.props} firebase={firebase} />
                    )}
                </AuthUserContext.Consumer>
            );
        }
    };

export default withAuth;
