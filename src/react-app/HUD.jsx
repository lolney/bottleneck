import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import DefensesBrowser from './defenses/DefensesBrowser.jsx';
import PropTypes from 'prop-types';
import ControlledButton from './ControlledButton.jsx';
import { resourceIcons } from '../config';
import AnimateOnChange from 'react-animate-on-change';

export default class HUD extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            resources: {
                wood: 0,
                stone: 0
            }
        };
        this.getInitial = this.getInitial.bind(this);
        this.addResouceUpdateListener = this.addResouceUpdateListener.bind(
            this
        );
    }

    componentDidMount() {
        this.props.socket.emit('resourceInitial');
        this.getInitial().then(() => this.addResouceUpdateListener());
    }

    getInitial() {
        return new Promise((resolve, reject) => {
            this.props.socket.once('resourceInitial', (data) => {
                console.log('Initial resources: ', data);
                this.setState({ resources: data });
                resolve();
            });
        });
    }

    addResouceUpdateListener() {
        this.props.socket.on('resourceUpdate', (data) => {
            let resources = { ...this.state.resources };
            if (data.shouldReset == true) {
                resources[data.name] = data.count;
            } else {
                resources[data.name] = resources[data.name] + data.count;
            }
            this.setState({ resources: resources });
        });
    }

    componentWillUnmount() {
        this.props.socket.removeListener('resourceUpdate');
    }

    render() {
        return (
            <div className="hud-buttons bootstrap-styles">
                <ButtonToolbar>
                    {resourceIcons.map((resource) => (
                        <ResourceButton
                            key={resource.name}
                            {...resource}
                            count={this.state.resources[resource.name]}
                        />
                    ))}
                    <ControlledButton
                        className="hud-button"
                        addWindow={(callback) =>
                            this.props.addWindow(
                                <DefensesBrowser
                                    imageSrcs={['assets/sprites/tree1.png']}
                                    socket={this.props.socket}
                                />,
                                'defensesBrowser',
                                callback
                            )
                        }
                        removeWindow={() =>
                            this.props.removeWindow('defensesBrowser')
                        }
                    >
                        <div className="hud-column">
                            <img
                                alt="defense icon"
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

const ResourceButton = ({ name, src, height, width, count }) => (
    <Button className="hud-button">
        <div className="hud-column">
            <img alt={name} src={src} height={height} width={width} />
        </div>
        <AnimateOnChange
            baseClassName="hud-column-2"
            animationClassName="updateable"
            animate={true}
        >
            {count}
        </AnimateOnChange>
    </Button>
);

HUD.propTypes = {
    addMenu: PropTypes.func.isRequired,
    addWindow: PropTypes.func.isRequired,
    removeWindow: PropTypes.func.isRequired,
    removeMenu: PropTypes.func.isRequired,
    socket: PropTypes.object.isRequired
};
