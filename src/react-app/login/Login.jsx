import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import OktaSignIn from '../../../static/okta-sign-in-no-jquery';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';
import '@okta/okta-signin-widget/dist/css/okta-theme.css';

import config from './config';

export default class LoginPage extends Component {
    constructor(props) {
        super(props);
        this.signIn = new OktaSignIn({
            /**
             * Note: when using the Sign-In Widget for an OIDC flow, it still
             * needs to be configured with the base URL for your Okta Org. Here
             * we derive it from the given issuer for convenience.
             */
            baseUrl: config.issuer.split('/oauth2')[0],
            clientId: config.client_id,
            redirectUri: config.redirect_uri,
            i18n: {
                en: {
                    'primaryauth.title': 'Sign in to Bottleneck'
                }
            },
            authParams: {
                responseType: ['id_token', 'token'],
                issuer: config.issuer,
                display: 'page',
                scopes: config.scope.split(' ')
            },
            features: {
                registration: true
            },
            idps: [{ type: 'GOOGLE', id: '0oaik6ac46Vofsk9n0h7' }]
        });
    }
    componentDidMount() {
        if (!this.signIn.token.hasTokensInUrl()) {
            const el = ReactDOM.findDOMNode(this);
            this.signIn.renderEl({ el });
        } else {
            this.signIn.token.parseTokensFromUrl(
                (res) => {
                    this.signIn.tokenManager.add('id_token', res);
                },
                (err) => {
                    console.error(err);
                }
            );
        }
    }
    render() {
        return <div />;
    }
}
