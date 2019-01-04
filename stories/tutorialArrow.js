import React from 'react';

import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';
import MyArrow from '../src/react-app/tutorial/TutorialArrow.jsx';
import '../src/react-app/CSS/Common.scss';

storiesOf('MyArrow', module)
    .addDecorator(StorybookConsole)
    .add('MyArrow', () => <MyArrow />);
