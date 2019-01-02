import EventEmitter from 'eventemitter3';

export default class EventMiddleware {
    constructor(openModal) {
        this.emitter = new EventEmitter();
        this.active = true;
        this.allowedEvent = undefined;
        this.openModal = openModal;

        this.handle = this.handle.bind(this);
    }

    async handle(event) {
        if (!this.active) {
            return true;
        }

        if (event === this.allowedEvent) {
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
}
