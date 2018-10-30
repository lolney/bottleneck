class Socket {
    init(socket) {
        this.socket = socket;
    }

    get connected() {
        return this.socket.connected;
    }

    on(event, handler) {
        this.socket.on(event, handler);
    }

    emit(event, data) {
        this.socket.emit(event, data);
    }

    removeListener(event, handler) {
        this.socket.removeListener(event, handler);
    }
}

export default new Socket();
