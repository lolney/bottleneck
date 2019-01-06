import EventEmitter from 'eventemitter3';

const allowedEvents = new Set([
    'resourceInitial',
    'solvedProblems',
    'siegeItems'
]);

export default class EventMiddleware {
    constructor(openModal) {
        this.emitter = new EventEmitter();
        this.active = true;
        this.allowedEvents = [];
        this.openModal = openModal;

        this.handle = this.handle.bind(this);
    }

    addAllowedEvents(events) {
        if (Array.isArray(events)) {
            this.allowedEvents = this.allowedEvents.concat(events);
        } else {
            this.allowedEvents.push(events);
        }
    }

    resetAllowedEvents() {
        this.allowedEvents = [];
    }

    async handle(event) {
        if (!this.active) {
            return true;
        }

        if (this.allowedEvents.includes(event) || allowedEvents.has(event)) {
            this.emitter.emit(event);
            return true;
        } else {
            return new Promise((resolve) => {
                this.openModal(
                    () => {
                        this.emitter.emit('stop');
                        resolve(true);
                    },
                    () => {
                        resolve(false);
                    }
                );
            });
        }
    }

    forward(event, data) {
        if (this.active) {
            this.emitter.emit(event, data);
        }
    }
}
