import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import DefencesBrowser from '../src/react-app/defences/DefencesBrowser.jsx';
import { WindowsContainer } from './windows';
import '../src/react-app/CSS/Defences.scss';

import { siegeItems } from './fixtures';
import { solvedProblems } from './fixtures';

let on = (event, callback) => {
    let data;
    if (event == 'siegeItems') {
        data = siegeItems;
    } else if (event == 'solvedProblems') {
        data = solvedProblems;
    }
    window.setTimeout(() => {
        callback(siegeItems);
    }, 50);
};

export const socket = {
    on: on,
    once: on,
    emit: () => {}
};

storiesOf('Adding defences', module)
    .addDecorator(StorybookConsole)
    .add('Defences Browser', () => (
        <DefencesBrowser openWindow={(code) => alert(code)} socket={socket} />
    ));
