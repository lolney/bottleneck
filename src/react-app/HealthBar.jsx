import React from 'react';
import PropTypes from 'prop-types';
import { playerBase } from '../config.js';
import MyArrow from './tutorial/TutorialArrow.jsx';

export default class HealthBar extends React.Component {
    constructor(props) {
        super(props);
        this.createBar = this.createBar.bind(this);
    }

    createBar(key) {
        let hp = this.props[key];
        const style = {
            transform: `scaleX(${hp / playerBase.baseHP})`
        };
        return (
            <div key={key} id={`${key}-bar`} className="bar-container">
                <div className={key} style={style} />
                <div className="bar-label">
                    <span className="outline-text">{hp}</span>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div>
                <div className="health-bar">
                    {['myHp', 'enemyHp'].map(this.createBar)}
                </div>
            </div>
        );
    }
}

HealthBar.propTypes = {
    myHp: PropTypes.number.isRequired,
    enemyHp: PropTypes.number.isRequired
};
