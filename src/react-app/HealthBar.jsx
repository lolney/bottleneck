import React from 'react';
import PropTypes from 'prop-types';
import { playerBase } from '../config.js';

export default class HealthBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hp: playerBase.baseHP };
        this.props.socket.on('hp', (data) => {
            console.log('hp updated');
            this.setState({ hp: data.hp });
            console.log(this.state.hp);
        });
    }

    render() {
        const style1 = { width: `scale(${this.state.hp / 10})` };
        //const style3 = { width: `scale(${this.state.hp / 10})` };
        const style3 = { width: '20%' };
        console.log(style1);
        return (
            <div className="health-bar">
                <div className="column-1" style={style1} />
                <div className="column-3" style={style3} />
            </div>
        );
    }
}

HealthBar.propTypes = {
    socket: PropTypes.object.isRequired
};
