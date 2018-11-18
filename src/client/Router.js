export default class Router {
    constructor(socket) {
        this.socket = socket;
    }

    makeDefense(defenseId, position) {
        console.log('making defense permanent');
        this.socket.emit('makeDefense', {
            defenseId: defenseId,
            position: position
        });
    }

    mergeObjects(defenseId, attachedObjectId) {
        console.log(`merging defense ${defenseId} with ${attachedObjectId}`);
        this.socket.emit('mergeDefenses', {
            defenseId: defenseId,
            gameObjectId: attachedObjectId
        });
    }
}
