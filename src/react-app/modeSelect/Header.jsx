import React from 'react';
import { Navbar, Button } from 'react-bootstrap';
import { withAuth } from '@okta/okta-react';

const GUEST_USER = { preferred_username: 'Guest' };

class HeaderAuth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticated: null,
            user: GUEST_USER
        };
        this.checkAuthentication = this.checkAuthentication.bind(this);
        this.checkAuthentication();
        this.login = this.login.bind(this);
        this.logout = this.logout.bind(this);
    }

    async checkAuthentication() {
        const authenticated = await this.props.auth.isAuthenticated();
        if (authenticated !== this.state.authenticated) {
            let user = await this.props.auth.getUser();
            if (!user) {
                user = GUEST_USER;
            }
            this.setState({ user, authenticated });
        }
    }

    async login() {
        // Redirect to '/' after login
        this.props.auth.login('/');
    }

    async logout() {
        // Redirect to '/' after logout
        try {
            await this.props.auth.logout('/');
        } catch (error) {
            console.error(error);
        }
        await this.checkAuthentication();
    }

    render() {
        return (
            <Header
                user={this.state.user}
                login={this.login}
                logout={this.logout}
            />
        );
    }
}

const Header = (props) => (
    <div id="header" className="bootstrap-styles">
        <Navbar>
            <Navbar.Text>
                Signed in as
                <Navbar.Link href="#">
                    {' '}
                    {props.user.preferred_username}
                </Navbar.Link>
            </Navbar.Text>
            <Navbar.Form pullRight>
                <SignIn {...props} />
            </Navbar.Form>
        </Navbar>
    </div>
);

const SignIn = ({ user, login, logout }) =>
    user.preferred_username == 'Guest' || user === undefined ? (
        <Button onClick={login}>Sign in</Button>
    ) : (
        <Button onClick={logout}>Sign out</Button>
    );

export default withAuth(HeaderAuth);
