import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import ConnectionOverlay from '../src/react-app/ConnectionOverlay.jsx';

import '../src/react-app/CSS/LoadingScreen.scss';

import MockSocket from './mockSocket';

let connect = MockSocket.create('connect');
let disconnect = MockSocket.create('disconnect');

storiesOf('ConnectionOverlay', module)
    .addDecorator(StorybookConsole)
    .add('Finishing', () => <ConnectionOverlay socket={connect.socket} />)
    .add('Matchmaking', () => <ConnectionOverlay socket={disconnect.socket} />);

//    .add('Disconnect Overlay', () => (
//        <ConnectionOverlay openWindow={(code) => alert(code)} socket={lose} />
//    ));
