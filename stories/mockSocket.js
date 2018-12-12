export default class MockSocket {
    constructor() {
        this.events = {};
        this.triggerQueue = {};
        this.socket = {
            on: this.on.bind(this),
            once: this.on.bind(this),
            addEventListener: this.on.bind(this),
            removeListener: () => {},
            emit: () => {}
        };
    }

    /**
     * Shorthand for creating and adding an event
     */
    static create(event, data = {}, interval = 50) {
        let mock = new MockSocket();
        mock.triggerEvent(event, data, interval);
        return mock.socket;
    }

    on(event, callback) {
        this.events[event] = callback;
        if (this.triggerQueue[event])
            for (const queued of this.triggerQueue[event]) {
                queued();
            }
    }

    triggerEvent(event, data = {}, interval = 50) {
        let timeout = () =>
            window.setTimeout(() => {
                this.events[event](data);
            }, interval);

        if (this.events[event]) {
            timeout();
        } else {
            let lst = this.triggerQueue[event];
            if (!lst) {
                this.triggerQueue[event] = [];
                lst = this.triggerQueue[event];
            }
            lst.push(timeout);
        }
        return this;
    }
}
