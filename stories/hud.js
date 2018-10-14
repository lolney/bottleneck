import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import HUD from '../src/react-app/HUD.jsx';
import '../src/react-app/CSS/HUD.scss';
import { socket } from './defences';

storiesOf('HUD', module)
    .addDecorator(StorybookConsole)
    .add('HUD', () => <HUD socket={socket} />);
