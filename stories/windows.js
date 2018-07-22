import React from 'react';

import { storiesOf } from '@storybook/react';
import Window from '../src/react-app/Window.jsx';
import Windows from '../src/react-app/Windows.jsx';

storiesOf('Windows', module).add('Windows', () => (
    <Windows>
        <p>Window 1</p>
        <p>Window 2</p>
    </Windows>
));
