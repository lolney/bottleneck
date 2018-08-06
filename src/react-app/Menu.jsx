import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import './CSS/Menu.scss';
import './CSS/MenuWindow.scss';
import PropTypes from 'prop-types';
import ControlledButton from './ControlledButton.jsx';
import DefencesBrowser from './defences/DefencesBrowser.jsx';
import SolutionHistory from './solution-history/SolutionHistory.jsx';

export default class MenuWindow extends React.Component {
    render() {
        return (
            <div className="menuWindow">
                <Menu
                    socket={this.props.socket}
                    addWindow={this.props.addWindow}
                    removeWindow={this.props.removeWindow}
                />
            </div>
        );
    }
}

class Menu extends React.Component {
    render() {
        return (
            <div className="menu">
                <div className="header">
                    <h1>Main Menu</h1>
                </div>
                <div className="menuElements bootstrap-styles">
                    <ButtonToolbar>
                        <ControlledButton
                            addWindow={() =>
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
                                    'solutionHistory'
                                )
                            }
                            removeWindow={() =>
                                this.props.removeWindow('solutionHistory')
                            }
                        >
                            Solution History
                        </ControlledButton>
                        <Button>Settings</Button>
                        <Button>Exit Game</Button>
                    </ButtonToolbar>
                </div>
            </div>
        );
    }
}

Menu.propTypes = {
    socket: PropTypes.object.isRequired,
    addWindow: PropTypes.func.isRequired,
    removeWindow: PropTypes.func.isRequired
};
