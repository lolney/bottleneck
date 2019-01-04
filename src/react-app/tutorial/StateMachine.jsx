import PropTypes from 'prop-types';

export const Status = {
    DONE: 'DONE',
    CONTINUE: 'CONTINUE'
};

export default class TutorialStateMachine {
    constructor(props) {
        this.props = props;
        this.states = this.props.states;
        this.stateIndex = -1;

        this.onClose = this.onClose.bind(this);
        this.onStop = this.onStop.bind(this);
    }

    async run(props) {
        while (true) {
            const status = await this.advanceState();
            if (status == Status.DONE) {
                break;
            }
        }
    }

    async advanceState() {
        this.stateIndex++;
        if (this.stateIndex > this.states.length) {
            return true;
        }

        const next = this.states[this.stateIndex];
        let proceed;

        if (next.nextTrigger.type == 'event') {
            // create alert that closes on this event type
            const eventName = next.nextTrigger.eventName;
            proceed = this.createWait(next, eventName);
        } else {
            // create alert on closes on proceeding
            proceed = this.createProceed(next);
        }

        return await proceed;
    }

    onClose(onEnd) {
        this.props.openModal(() => onEnd(Status.DONE));
    }

    onStop(onEnd, alert) {
        this.props.eventMiddleware.emitter.once('stop', () => {
            onEnd(Status.DONE);
        });
    }

    /**
     * Creates a `TutorialProceed` tutorial message
     * Returns a promise that resolves on the user proceeding;
     * is rejected on the user canceling
     * @param {*} msg
     */
    createProceed(next) {
        if (next.arrow) {
            var arrow = this.props.showArrow(next.arrow);
        }

        return new Promise((resolve, reject) => {
            const onEnd = (status) => {
                if (arrow) {
                    arrow.remove();
                }
                this.props.alert.remove(alert);
                this.props.eventMiddleware.emitter.removeAllListeners();
                resolve(status);
            };

            const Component = this.props.renderProceed({
                msg: next.text,
                onProceed: () => onEnd(Status.CONTINUE),
                onClose: () => this.onClose(onEnd)
            });
            const alert = this.props.alert.show(Component);

            this.onStop(onEnd, alert);
        });
    }

    /**
     * Creates a `TutorialWait` tutorial message
     * Returns a promise that resolves on the correct event;
     * is rejected on the user canceling
     * @param {*} msg
     */
    createWait(next, eventName) {
        if (next.arrow) {
            var arrow = this.props.showArrow(next.arrow);
        }
        if (next.nextTrigger.eventType !== 'server') {
            this.props.eventMiddleware.addAllowedEvents(eventName);
        }
        if (next.nextTrigger.allowedEvents) {
            this.props.eventMiddleware.addAllowedEvents(
                next.nextTrigger.allowedEvents
            );
        }

        return new Promise((resolve) => {
            const onEnd = (status) => {
                if (arrow) {
                    arrow.remove();
                }
                this.props.eventMiddleware.emitter.removeAllListeners();
                this.props.eventMiddleware.resetAllowedEvents();
                this.props.alert.remove(alert);
                resolve(status);
            };

            const Component = this.props.renderWait({
                msg: next.text,
                onClose: () => this.onClose(onEnd)
            });

            const alert = this.props.alert.show(Component);

            this.props.eventMiddleware.emitter.once(eventName, () => {
                onEnd(Status.CONTINUE);
            });
            this.onStop(onEnd, alert);
        });
    }

    render() {
        return null;
    }
}

TutorialStateMachine.propTypes = {
    alert: PropTypes.object.isRequired,
    openModal: PropTypes.func.isRequired,
    eventMiddleware: PropTypes.object.isRequired,
    renderWait: PropTypes.func.isRequired,
    renderProceed: PropTypes.func.isRequired
};
