import StorybookConsole from 'react-storybook-console';
import { storiesOf } from '@storybook/react';

import React from 'react';
import { Provider } from 'react-alert';
import { Fragment } from 'react';
import { withAlert } from 'react-alert';
import AlertContents from '../src/react-app/tutorial/AlertContents.jsx';
import '../src/react-app/tutorial/AlertContents.scss';

const options = {
    timeout: 0,
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
                props.alert.show(
                    <AlertContents
                        msg={
                            'This is an alert that waits for an event before continuing'
                        }
                    />
                );
            }}
        >
            Alert w/ wait
        </button>
        <button
            onClick={() => {
                const onProceed = () => {};
                props.alert.show(
                    <AlertContents
                        msg={'This is an alert that waits for you to proceed'}
                        onProceed={onProceed}
                    />
                );
            }}
        >
            Alert w/ proceed
        </button>
    </Fragment>
));

const Wrapper = (props) => props.message;

storiesOf('TutorialAlerts', module)
    .addDecorator(StorybookConsole)
    .add('TutorialAlerts', () => <TutorialAlerts />);
