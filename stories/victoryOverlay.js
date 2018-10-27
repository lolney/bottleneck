import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import VictoryOverlay from '../src/react-app/VictoryOverlay.jsx';

//import { solvedProblems } from './fixtures';

import '../src/react-app/CSS/VictoryOverlay.scss';

export const socket = {
    addEventListener: (event, callback) => {
        window.setTimeout(() => 50);
    },
    emit: () => {}
};

storiesOf('VictoryOverlay', module)
    .addDecorator(StorybookConsole)
    .add('Victory Overlay', () => (
        <VictoryOverlay openWindow={(code) => alert(code)} socket={socket} />
    ));
