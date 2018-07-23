import React from 'react';

import { storiesOf } from '@storybook/react';
import SolutionHistory from '../src/react-app/solution-history/SolutionHistory.jsx';
import { Grid } from '../src/react-app/solution-history/Grid.jsx';

const solvedProblems = [
    { problem: { name: '1', type: 'image' }, code: 'code' },
    { problem: { name: '2', type: 'btree' }, code: 'code' }
];

const socket = {
    on: (event, callback) => {
        window.setTimeout(() => {
            callback(solvedProblems);
        }, 1);
    },
    emit: () => {}
};

storiesOf('SolutionHistory', module).add('Solution History', () => (
    <SolutionHistory socket={socket} />
));

storiesOf('Grid', module).add('Grid', () => (
    <Grid problems={[{ name: 'hello' }, { name: 'goodbye' }]} />
));
