import React, { Fragment } from 'react';
import { Navbar, Button } from 'react-bootstrap';
import withAuth from '../login/withAuth.jsx';
import { Modal } from 'react-bootstrap';
import Login from '../login/Login.jsx';

class HeaderAuth extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalOpen: false
        };
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
            <div className="bootstrap-styles">
                <Header
                    user={this.props.user}
                    login={(modalTitle) => {
                        this.setState({ modalTitle, modalOpen: true });
                    }}
                    logout={this.logout}
                />
                {this.state.modalOpen && (
                    <LoginModal
                        title={this.state.modalTitle}
                        onClose={() =>
                            this.setState({
                                modalTitle: undefined,
                                modalOpen: false
                            })
                        }
                    />
                )}
            </div>
        );
    }
}

const LoginModal = ({ onClose, title }) => (
    <Modal.Dialog bsSize="small">
        <Modal.Header onHide={onClose} closeButton>
            <Modal.Title id="modal-title">{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Login onSuccess={onClose} />
        </Modal.Body>
    </Modal.Dialog>
);

const Header = (props) => (
    <div id="header" className="bootstrap-styles">
        <Navbar>
            <Navbar.Form pullRight id="master">
                <Navbar.Text>
                    <img
                        id="image"
                        alt="guest-user"
                        src="assets/noun_unknown user_102994.png"
                        height="40vh"
                        width="40vh"
                    />
                    <Navbar.Link href="#" id="text">
                        {' '}
                        {props.user ? props.user.displayName : 'Loading'}
                    </Navbar.Link>
                </Navbar.Text>
                <Navbar.Form className="navbar-text">
                    <SignIn {...props} />
                </Navbar.Form>
            </Navbar.Form>
        </Navbar>
    </div>
);

const SignIn = ({ user, login, logout }) =>
    !user ? null : user.displayName == 'Guest' ? (
        <Fragment>
            <Button className="hud-button" onClick={() => login('Sign in')}>
                Sign in
            </Button>
            <Button className="hud-button" onClick={() => login('Sign up')}>
                Register
            </Button>
        </Fragment>
    ) : (
        <Button className="hud-button" onClick={logout}>
            Sign out
        </Button>
    );

export default withAuth(HeaderAuth);
