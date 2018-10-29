import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import DefensesBrowser from '../src/react-app/defenses/DefensesBrowser.jsx';
import '../src/react-app/CSS/Defenses.scss';

import { siegeItems } from '../src/config';
import { solvedProblems } from '../src/config';

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

storiesOf('Adding defenses', module)
    .addDecorator(StorybookConsole)
    .add('Defenses Browser', () => (
        <DefensesBrowser openWindow={(code) => alert(code)} socket={socket} />
    ));
