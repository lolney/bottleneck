class Router {
    init(socket) {
        this.socket = socket;
    }

    makeDefence(defenceId, position) {
        console.log('making defence permanent');
        this.socket.emit('makeDefence', {
            defenceId: defenceId,
            position: position
        });
    }

    mergeObjects(defenceId, attachedObjectId) {
        console.log(`merging defence ${defenceId} with ${attachedObjectId}`);
        this.socket.emit('mergeDefences', {
            defenceId: defenceId,
            gameObjectId: attachedObjectId
        });
    }
}

export default new Router();
