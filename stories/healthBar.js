import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import HealthBar from '../src/react-app/HealthBar.jsx';
import HealthBarContainer from '../src/react-app/HealthBarContainer.jsx';
import { playerBase } from '../src/config.js';

import '../src/react-app/CSS/HealthBar.scss';

let eventMaker = (callback) => {
    return (hp, timeout) => {
        window.setTimeout(() => {
            callback({ myHp: hp, enemyHp: hp });
        }, timeout);
    };
};

export const socket = {
    on: (_, callback) => {
        let ev = eventMaker(callback);

        let iters = 10;
        let interval = 500;
        let fn = () => {
            for (let i = 0; i < iters; i++) {
                ev(((iters - i - 1) * playerBase.baseHP) / iters, i * interval);
            }
        };
        fn();
        window.setInterval(fn, interval * iters);
    },
    emit: () => {}
};

storiesOf('HealthBar', module)
    .addDecorator(StorybookConsole)
    .add('Health Bar', () => (
        <HealthBar myHp={playerBase.baseHP / 2} enemyHp={playerBase.baseHP} />
    ))
    .add('Health Bar With Events', () => (
        <HealthBarContainer socket={socket} />
    ));
