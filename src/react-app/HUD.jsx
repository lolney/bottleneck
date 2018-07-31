import React from 'react';
import { ButtonToolbar, Button } from 'react-bootstrap';
import './CSS/HUD.scss';
import PropTypes from 'prop-types';

export default class HUD extends React.Component {
    constructor(props) {
        super(props);

        this.onClick = this.onClick.bind(this);
    }
    onClick() {
        this.props.onClick();
    }

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
                    <Button>
                        <div className="hud-column">img</div>
                        <div className="hud-column">txt</div>
                    </Button>
                    <Button className="btm-btn" onClick={this.onClick}>
                        Menu
                    </Button>
                </ButtonToolbar>
            </div>
        );
    }
}

HUD.propTypes = {
    onClick: PropTypes.func.isRequired
};
