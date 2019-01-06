import React from 'react';
import { Navbar, Button } from 'react-bootstrap';
import './ModeSelect.scss';
import withAuth from '../login/withAuth.jsx';

class HeaderAuth extends React.Component {
    constructor(props) {
        super(props);
        this.logout = this.logout.bind(this);
    }

    async logout() {
        // Redirect to '/' after logout
        try {
            await this.props.firebase.auth().signOut();
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        return (
            <Header
                user={this.props.user}
                login={() => {
                    window.open('/login', '_self');
                }}
                logout={this.logout}
            />
        );
    }
}

const Header = (props) => (
    <div id="header" className="bootstrap-styles">
        <Navbar>
            <Navbar.Header />
            <Navbar.Text pullRight>
                <img
                    id="image"
                    alt="guest-user"
                    src="assets/noun_unknown user_102994.png"
                    height="20px"
                    width="20px"
                />
                <Navbar.Link href="#" id="text">
                    {' '}
                    {props.user.displayName}
                </Navbar.Link>
            </Navbar.Text>
            <Navbar.Form pullRight>
                <SignIn {...props} />
            </Navbar.Form>
        </Navbar>
    </div>
);

const SignIn = ({ user, login, logout }) =>
    user.displayName == 'Guest' || user === undefined ? (
        <Button className="hud-button" onClick={login}>
            Sign in
        </Button>
    ) : (
        <Button className="hud-button" onClick={logout}>
            Sign out
        </Button>
    );

export default withAuth(HeaderAuth);
