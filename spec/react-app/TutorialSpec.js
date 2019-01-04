import TutorialStateMachine, {
    Status
} from '../../src/react-app/tutorial/StateMachine.jsx';
import EventMiddleware from '../../src/react-app/tutorial/eventMiddleware.js';

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
    let component;

    beforeEach(() => {
        eventMiddleware = new EventMiddleware();
        const props = {
            alert: {
                remove: () => {},
                show: (_component) => {
                    component = _component;
                }
            },
            openModal: () => {},
            showArrow: () => {
                () => {};
            },
            eventMiddleware,
            states: [fixtures.close, fixtures.event],
            renderWait: () => 'msg',
            renderProceed: () => 'msg'
        };
        stateMachine = new TutorialStateMachine(props);
    });

    const stopEvent = async () => {
        const promise = stateMachine.advanceState();

        eventMiddleware.emitter.emit('stop');
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

        it('stops when clicking stop', () => {});

        it('stops if stop event received', async () => {
            await stopEvent();
        });
    });

    describe('when given a close trigger', () => {
        beforeEach(() => {
            stateMachine.stateIndex = -1;
        });

        it('proceeds when clicking proceed', () => {});

        it('stops when clicking stop', () => {});

        it('stops if stop event received', async () => {
            await stopEvent();
        });
    });
});
