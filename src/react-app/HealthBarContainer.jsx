import React from 'react';
import PropTypes from 'prop-types';
import HealthBar from './HealthBar.jsx';
import { playerBase } from '../config.js';

export default class HealthBarContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = { myHp: playerBase.baseHP, enemyHp: playerBase.baseHP };

        this.props.socket.on('hp', (data) => {
            this.setState(data);
        });
    }

    render() {
        return (
            <HealthBar myHp={this.state.myHp} enemyHp={this.state.enemyHp} />
        );
    }
}

HealthBarContainer.propTypes = {
    socket: PropTypes.object.isRequired
};
