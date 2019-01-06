import React from 'react';
import { Navbar, Button } from 'react-bootstrap';
import './ModeSelect.scss';
import withAuth from '../login/withAuth.jsx';

const GUEST_USER = { displayName: 'Guest' };

class HeaderAuth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            authenticated: null,
            user: GUEST_USER
        };
        this.logout = this.logout.bind(this);
    }

    componentDidMount() {
        this.unregisterAuthObserver = this.props.firebase
            .auth()
            .onAuthStateChanged((user) =>
                this.setState({
                    authenticated: !!user,
                    user: user ? user : GUEST_USER
                })
            );
    }

    // Make sure we un-register Firebase observers when the component unmounts.
    componentWillUnmount() {
        this.unregisterAuthObserver();
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
                user={this.state.user}
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
