import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import HUD from '../src/react-app/HUD.jsx';
import '../src/react-app/CSS/HUD.scss';
import MockSocket from './mockSocket';

let getSocket = (interval) => {
    let mockSocket = new MockSocket();
    let update = { name: 'wood', count: 5 };
    mockSocket.triggerEvent('resourceInitial', { wood: 10, stone: 10 });
    for (let i = 0; i < 10; i++) {
        mockSocket.triggerEvent(
            'resourceUpdate',
            update,
            (i + 1) * (interval * 1000)
        );
    }
    return mockSocket.socket;
};

storiesOf('HUD', module)
    .addDecorator(StorybookConsole)
    .add('HUD 1-second updates', () => <HUD socket={getSocket(1)} />)
    .add('HUD 5-second updates', () => <HUD socket={getSocket(5)} />);
