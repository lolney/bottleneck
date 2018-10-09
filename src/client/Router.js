class Router {
    init(socket) {
        this.socket = socket;
    }

    makeDefence(defenceId, position) {
        console.log('making defence permanent');
        this.socket.emit('makeDefence', {
            position: position,
            defenceId: defenceId
        });
    }
}

export default new Router();
