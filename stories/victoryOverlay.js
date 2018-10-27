import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import VictoryOverlay from '../src/react-app/VictoryOverlay.jsx';

//import { solvedProblems } from './fixtures';

import '../src/react-app/CSS/VictoryOverlay.scss';

export const socket = {
    create(eventName) {
        return {
            addEventListener: (event, callback) => {
                window.setTimeout(
                    () => (event == eventName ? callback() : null),
                    1000
                );
            },
            emit: () => {}
        };
    }
};

storiesOf('VictoryOverlay', module)
    .addDecorator(StorybookConsole)
    .add('Win Overlay', () => (
        <VictoryOverlay
            openWindow={(code) => alert(code)}
            socket={socket.create('gameWin')}
        />
    ))
    .add('Lose Overlay', () => (
        <VictoryOverlay
            openWindow={(code) => alert(code)}
            socket={socket.create('gameLose')}
        />
    ));
