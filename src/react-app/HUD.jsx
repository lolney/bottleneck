import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import './CSS/HUD.scss';
import DefencesBrowser from './defences/DefencesBrowser.jsx';
import PropTypes from 'prop-types';

export default class HUD extends React.Component {
    render() {
        return (
            <div className="hud-buttons bootstrap-styles">
                <ButtonToolbar>
                    <Button className="top-btn">
                        <div className="hud-column">
                            <img
                                alt="log icon"
                                src="assets/log.png"
                                height="20px"
                                width="20px"
                            />
                        </div>
                        <div className="hud-column">txt</div>
                    </Button>
                    <Button>
                        <div className="hud-column">
                            <img
                                alt="rock icon"
                                src="assets/rock-particle.png"
                                height="20px"
                                width="20px"
                            />
                        </div>
                        <div className="hud-column">txt</div>
                    </Button>
                    <ControlledButton
                        addWindow={this.props.addWindow}
                        removeWindow={this.props.removeWindow}
                    />
                    <Button className="btm-btn" onClick={this.props.openWindow}>
                        Menu
                    </Button>
                </ButtonToolbar>
            </div>
        );
    }
}

class ControlledButton extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selected: false
        };
        this.toggleSelect = this.toggleSelect.bind(this);
    }
    toggleSelect() {
        this.setState((prevState) => ({ selected: !prevState.selected }));
    }

    render() {
        let addWindow = () => {
            this.props.addWindow(
                <DefencesBrowser imageSrcs={['assets/sprites/tree1.png']} />,
                'defencesBrowser'
            );
        };
        return (
            <Button
                onClick={() => {
                    if (this.state.selected == false) {
                        addWindow();
                        this.toggleSelect();
                    } else {
                        try {
                            this.props.removeWindow('defencesBrowser');
                            this.toggleSelect();
                        } catch (error) {
                            console.log(error);
                            addWindow();
                        }
                    }
                }}
            >
                <div className="hud-column">
                    <img
                        alt="defence icon"
                        src="assets/noun_rook_3679.svg"
                        height="20px"
                        width="20px"
                    />
                </div>
                <div className="hud-column">Defences</div>
            </Button>
        );
    }
}

HUD.propTypes = {
    openWindow: PropTypes.func.isRequired,
    addWindow: PropTypes.func.isRequired,
    removeWindow: PropTypes.func.isRequired
};

ControlledButton.propTypes = {
    addWindow: PropTypes.func.isRequired,
    removeWindow: PropTypes.func.isRequired
};

/*
{() =>
    this.props.addWindow(
        <DefencesBrowser
            imageSrcs={['assets/sprites/tree1.png']}
        />,
        'defencesBrowser'
    )
}
*/
