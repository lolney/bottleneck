import TutorialStateMachine, {
    Status
} from '../../src/react-app/tutorial/StateMachine.jsx';
import EventMiddleware from '../../src/react-app/tutorial/eventMiddleware.js';
import AlertContents from '../../src/react-app/tutorial/AlertContents.jsx';
import React from 'react';

import { mount } from 'enzyme';
import CancelDialog from '../../src/react-app/tutorial/CancelDialog.jsx';

const fixtures = {
    close: {
        text:
            'Welcome to Bottleneck! To progress, you’ll have to unlock some resources.',
        nextTrigger: {
            type: 'close'
        }
    },
    event: {
        text: 'Buy an assault bot by clicking on the button to the right.',
        arrow: {
            type: 'dom object',
            target: '.btn-assault-bot'
        },
        nextTrigger: {
            type: 'event',
            eventName: 'makeAssaultBot',
            eventType: 'req'
        }
    }
};

describe('StateMachine', () => {
    let stateMachine;
    let eventMiddleware;
    let alert;
    let closeDialog;

    beforeEach(() => {
        eventMiddleware = new EventMiddleware();
        const props = {
            alert: {
                remove: () => {},
                show: (_alert) => {
                    alert = _alert;
                }
            },
            openModal: (onOk, onCancel) => {
                closeDialog = mount(
                    <CancelDialog ok={onOk} cancel={onCancel} />
                );
            },
            showArrow: () => {
                () => {};
            },
            eventMiddleware,
            states: [fixtures.close, fixtures.event],
            renderWait: (props) => mount(<AlertContents {...props} />),
            renderProceed: (props) => mount(<AlertContents {...props} />)
        };
        stateMachine = new TutorialStateMachine(props);
    });

    const stopEvent = async () => {
        const promise = stateMachine.advanceState();

        eventMiddleware.emitter.emit('stop');
        const status = await promise;

        expect(status).toEqual(Status.DONE);
    };

    const stopClick = async () => {
        const promise = stateMachine.advanceState();
        alert.find('.close-btn-container').simulate('click');
        closeDialog.find('.btn-default').simulate('click');

        const status = await promise;

        expect(status).toEqual(Status.DONE);
    };

    describe('when given an event to wait on', () => {
        beforeEach(() => {
            stateMachine.stateIndex = 0;
        });

        it('proceeds when the event is emitted', async () => {
            const promise = stateMachine.advanceState();

            eventMiddleware.emitter.emit(fixtures.event.nextTrigger.eventName);
            const status = await promise;

            expect(status).toEqual(Status.CONTINUE);
        });

        it('stops when clicking stop', async () => {
            await stopClick();
        });

        it('stops if stop event received', async () => {
            await stopEvent();
        });
    });

    describe('when given a close trigger', () => {
        beforeEach(() => {
            stateMachine.stateIndex = -1;
        });

        it('proceeds when clicking proceed', async () => {
            const promise = stateMachine.advanceState();
            alert.find('.proceed-btn-container').simulate('click');

            const status = await promise;

            expect(status).toEqual(Status.CONTINUE);
        });

        it('stops when clicking stop', async () => {
            await stopClick();
        });

        it('stops if stop event received', async () => {
            await stopEvent();
        });
    });
});
