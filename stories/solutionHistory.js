import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import SolutionHistory from '../src/react-app/solution-history/SolutionHistory.jsx';
import Grid from '../src/react-app/solution-history/Grid.jsx';

import { solvedProblems } from './fixtures';

import '../src/react-app/CSS/Solutions.scss';

export const socket = {
    on: (event, callback) => {
        window.setTimeout(() => {
            callback(solvedProblems);
        }, 50);
    },
    emit: () => {}
};

storiesOf('SolutionHistory', module)
    .addDecorator(StorybookConsole)
    .add('Solution History', () => <SolutionHistory socket={socket} />)
    .add('Grid', () => <Grid solvedProblems={solvedProblems} />);
