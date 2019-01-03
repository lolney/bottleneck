import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-alert';
import { Component, Fragment } from 'react';
import AlertTemplate from 'react-alert-template-basic';
import { withAlert } from 'react-alert';
import AlertContents from '../src/react-app/tutorial/AlertContents.jsx';
import '../src/react-app/tutorial/AlertContents.scss';

const options = {
    timeout: 5000,
    position: 'bottom center'
};

const TutorialAlerts = () => (
    <Provider template={Wrapper} {...options}>
        <InnerAlertComponent />
    </Provider>
);

const InnerAlertComponent = withAlert((props) => (
    <Fragment>
        <button
            onClick={() => {
                props.alert.show(<AlertContents />);
            }}
        >
            Show Alert
        </button>
        <button
            onClick={() => {
                const onProceed = () => {};
                props.alert.show(<AlertContents onProceed={onProceed} />);
            }}
        >
            Oops, an error
        </button>
        <button
            onClick={() => {
                props.alert.success('It\'s ok now!');
            }}
        >
            Success!
        </button>
    </Fragment>
));

const style = {
    font: 'italic bold 0.75em arial,serif'
};

const Wrapper = (props) => props.message;

storiesOf('TutorialAlerts', module)
    .addDecorator(StorybookConsole)
    .add('TutorialAlerts', () => <TutorialAlerts />);
