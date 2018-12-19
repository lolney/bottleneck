/**
 * Wrapper for the socket.io socket, handling req/res transactions
 */
export default class Socket {
    constructor(socket, requireAuth = true) {
        if (requireAuth) {
            Socket.handleAuth(socket);
        }
        this.suspended = false;

        this.socket = socket;
        this.connect = this.open;
        this.disconnect = this.close;
    }

    static handleAuth(socket) {
        // @unimplemented
        if (!socket.auth) throw new Error('User is not authenticated');
    }

    get playerNumber() {
        return this.socket.playerId;
    }

    get userId() {
        return this.socket.client.userId;
    }

    get botExists() {
        return this.socket.bot === true;
    }

    set botExists(bool = true) {
        this.socket.bot = bool;
    }

    emit(event, data, fn) {
        this.socket.emit(event, data, fn);
    }

    on(event, handler) {
        this.socket.on(event, (data) => {
            if (!this.suspended) handler(data);
        });
    }

    close() {
        this.socket.close();
    }

    open() {
        this.socket.open();
    }

    /**
     * Register a one-time handler for `event`
     * @param {string} event
     * @param {function} fn, optional
     * @returns A promise containing the received data
     */
    async once(event, fn) {
        return new Promise((resolve) => {
            this.socket.once(event, (data) => {
                const result = fn ? fn(data) : data;
                resolve(result);
            });
        });
    }

    /**
     * Called to register an event listener for responding to requests
     *
     * ` socket.transaction(event. (data) => Response.err('message')) `
     * ` socket.transaction(event, (data) => Response.ok(data)) `
     *
     * @param {*} event
     */
    transaction(event, handler) {
        this.socket.on(event, async (data, fn) => {
            if (!this.suspended) {
                let resp = await handler(data);
                fn(resp);
            } else {
                fn(Response.err('Application state is suspended'));
            }
        });
    }

    /**
     * @param {*} event
     * @param {*} data
     * @returns promise containing the response
     */
    async request(event, data) {
        return new Promise((resolve) => {
            this.socket.emit(event, data, (resp) => {
                resolve(resp);
            });
        });
    }
}

export class Response {
    static get ERROR() {
        return 'ERROR';
    }

    static get SUCCESS() {
        return 'SUCCESS';
    }

    static err(msg) {
        return { type: Response.ERROR, msg };
    }

    static ok(data) {
        return { type: Response.SUCCESS, data };
    }
}
