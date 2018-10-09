import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import DefencesBrowser from './defences/DefencesBrowser.jsx';
import PropTypes from 'prop-types';
import ControlledButton from './ControlledButton.jsx';
import Menu from './Menu.jsx';
import { Modal } from 'react-bootstrap';

export default class HUD extends React.Component {
    constructor(props) {
        super(props);

        console.log('constructing HUD');

        this.state = {
            resources: {
                wood: 0,
                stone: 0
            }
        };
        // Listen for initial update first
        this.props.socket.once('resourceInitial', (data) => {
            console.log('got initial: ', data);
            this.setState({ ...this.state, resources: data });

            this.props.socket.on('resourceUpdate', (data) => {
                let resources = { ...this.state.resources };
                if (data.shouldReset == true) {
                    resources[data.name] = data.count;
                } else {
                    resources[data.name] = resources[data.name] + data.count;
                }
                this.setState({ ...this.state, resources: resources });
            });
        });
        this.props.socket.emit('resourceInitial');
    }

    render() {
        return (
            <div className="hud-buttons bootstrap-styles">
                <ButtonToolbar>
                    <Button
                        className="top-btn hud-button"
                        onClick={this.handleShow}
                    >
                        <div className="hud-column">
                            <img
                                alt="log icon"
                                src="assets/log.png"
                                height="20px"
                                width="20px"
                            />
                        </div>
                        <div className="hud-column-2">
                            {this.state.resources['wood']}
                        </div>
                    </Button>
                    <Button className="hud-button">
                        <div className="hud-column">
                            <img
                                alt="rock icon"
                                src="assets/rock-particle.png"
                                height="20px"
                                width="20px"
                            />
                        </div>
                        <div className="hud-column-2">
                            {this.state.resources['stone']}
                        </div>
                    </Button>
                    <ControlledButton
                        className="hud-button"
                        addWindow={(callback) =>
                            this.props.addWindow(
                                <DefencesBrowser
                                    imageSrcs={['assets/sprites/tree1.png']}
                                    socket={this.props.socket}
                                />,
                                'defencesBrowser',
                                callback
                            )
                        }
                        removeWindow={() =>
                            this.props.removeWindow('defencesBrowser')
                        }
                    >
                        <div className="hud-column">
                            <img
                                alt="defence icon"
                                src="assets/noun_rook_3679.svg"
                                height="20px"
                                width="20px"
                            />
                        </div>
                        <div className="hud-column-2">Siege Tools</div>
                    </ControlledButton>
                    <ControlledButton
                        className="btm-btn hud-button"
                        addWindow={(callback) =>
                            this.props.addMenu(callback, this.props.socket)
                        }
                        removeWindow={(key) => this.props.removeMenu()}
                    >
                        Menu
                    </ControlledButton>
                </ButtonToolbar>
            </div>
        );
    }
}

HUD.propTypes = {
    addMenu: PropTypes.func.isRequired,
    addWindow: PropTypes.func.isRequired,
    removeWindow: PropTypes.func.isRequired,
    removeMenu: PropTypes.func.isRequired,
    socket: PropTypes.object.isRequired
};
