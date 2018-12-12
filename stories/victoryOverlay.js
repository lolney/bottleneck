import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import VictoryOverlay from '../src/react-app/VictoryOverlay.jsx';

//import { solvedProblems } from './fixtures';

import '../src/react-app/CSS/VictoryOverlay.scss';

import MockSocket from './mockSocket';

let win = MockSocket.create('gameWin');
let lose = MockSocket.create('gameLose');

storiesOf('VictoryOverlay', module)
    .addDecorator(StorybookConsole)
    .add('Win Overlay', () => (
        <VictoryOverlay openWindow={(code) => alert(code)} socket={win} />
    ))
    .add('Lose Overlay', () => (
        <VictoryOverlay openWindow={(code) => alert(code)} socket={lose} />
    ));
