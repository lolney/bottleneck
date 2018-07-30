import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import Menu from '../src/react-app/Menu.jsx';
import '../src/react-app/CSS/Menu.scss';

storiesOf('Menu', module)
    .addDecorator(StorybookConsole)
    .add('Menu', () => <Menu />);
