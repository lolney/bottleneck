import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import HUD from '../src/react-app/solution-history/HUD.jsx';
import '../src/react-app/CSS/HUD.scss';

storiesOf('HUD', module)
    .addDecorator(StorybookConsole)
    .add('HUD', () => <HUD />);
