import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import ControlledButton from './ControlledButton.jsx';
import SolutionHistory from './solution-history/SolutionHistory.jsx';

export default class MenuWindow extends React.Component {
    render() {
        return (
            <div className="menuWindow">
                <Menu
                    socket={this.props.socket}
                    addWindow={this.props.addWindow}
                    removeWindow={this.props.removeWindow}
                    removeMenu={this.props.removeMenu}
                />
            </div>
        );
    }
}

class Menu extends React.Component {
    render() {
        return (
            <div className="menu">
                <div className="barStyle">
                    <Button
                        onClick={this.props.removeMenu}
                        style={{
                            position: 'absolute',
                            right: '1px',
                            top: '1px',
                            padding: '1px',
                            background: 'rgba(241, 241, 241, 0.0)',
                            border: 'none',
                            outline: 'none'
                        }}
                    >
                        <div>
                            <img
                                src="assets/x.svg"
                                alt="close-button"
                                height="15px"
                                width="15px"
                            />
                        </div>
                    </Button>
                </div>
                <div className="header">
                    <h1>Main Menu</h1>
                </div>
                <div className="menuElements">
                    <ButtonToolbar>
                        <ControlledButton
                            className="menu-button"
                            addWindow={(callback) =>
                                this.props.addWindow(
                                    <SolutionHistory
                                        socket={this.props.socket}
                                        openWindow={(code, id) => {
                                            this.props.socket.emit(
                                                'solvedProblem',
                                                {
                                                    id: id
                                                }
                                            );
                                        }}
                                    />,
                                    'solutionHistory',
                                    callback
                                )
                            }
                            removeWindow={() =>
                                this.props.removeWindow('solutionHistory')
                            }
                        >
                            Solution History
                        </ControlledButton>
                        <Button className="menu-button">Settings</Button>
                        <Button
                            className="menu-button"
                            onClick={() => window.location.assign('/')}
                        >
                            Exit Game
                        </Button>
                    </ButtonToolbar>
                </div>
            </div>
        );
    }
}

Menu.propTypes = {
    socket: PropTypes.object.isRequired,
    addWindow: PropTypes.func.isRequired,
    removeWindow: PropTypes.func.isRequired,
    removeMenu: PropTypes.func.isRequired
};
