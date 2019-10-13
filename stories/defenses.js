import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import DefensesBrowser from '../src/react-app/defenses/DefensesBrowser.jsx';
import '../src/react-app/CSS/Defenses.scss';

import { siegeItems } from '../src/config';
import MockSocket from './mockSocket';

let socket = new MockSocket()
    .triggerEvent('resourceInitial', { wood: 0, stone: 0 })
    .triggerEvent('resourceUpdate', { count: 10, name: 'wood' }, 0)
    .triggerEvent('resourceUpdate', { count: 10, name: 'wood' }, 5000)
    .triggerEvent('siegeItems', siegeItems).socket;

storiesOf('Adding defenses', module)
    .addDecorator(StorybookConsole)
    .add('Defenses Browser', () => (
        <DefensesBrowser openWindow={(code) => alert(code)} socket={socket} />
    ));
