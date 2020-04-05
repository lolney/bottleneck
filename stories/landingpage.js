import React from 'react';
import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import ModeSelect from '../src/react-app/modeSelect/ModeSelect.jsx';

storiesOf('Landing Page', module)
    .addDecorator(StorybookConsole)
    .add('Landing Page', () => <ModeSelect />);
