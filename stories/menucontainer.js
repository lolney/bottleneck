import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import MenuContainer from '../src/react-app/MenuContainer.jsx';

storiesOf('MenuContainer', module)
    .addDecorator(StorybookConsole)
    .add('MenuContainer', () => <MenuContainer />);
