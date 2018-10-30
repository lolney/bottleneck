import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import DefensesBrowser from '../src/react-app/defenses/DefensesBrowser.jsx';
import '../src/react-app/CSS/Defenses.scss';

import { siegeItems } from '../src/config';
import { solvedProblems } from '../src/config';
import MockSocket from './mockSocket';

let socket = new MockSocket()
    .triggerEvent('siegeItems', siegeItems)
    .triggerEvent('solvedProblems', solvedProblems).socket;

storiesOf('Adding defenses', module)
    .addDecorator(StorybookConsole)
    .add('Defenses Browser', () => (
        <DefensesBrowser openWindow={(code) => alert(code)} socket={socket} />
    ));
