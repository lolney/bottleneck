import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import HealthBar from '../src/react-app/HealthBar.jsx';

import '../src/react-app/CSS/HealthBar.scss';

export const socket = {
    on: (event, callback) => {
        window.setTimeout(() => {
            callback({ hp: 1 });
        }, 50);
    },
    emit: () => {}
};

storiesOf('HealthBar', module)
    .addDecorator(StorybookConsole)
    .add('Health Bar', () => (
        <HealthBar openWindow={(code) => alert(code)} socket={socket} />
    ));
