export default class Router {
    constructor(socket) {
        this.socket = socket;
    }

    makeDefense(defenseId, position) {
        console.log('making defense permanent');
        return this.socket.request('makeDefense', {
            defenseId: defenseId,
            position: position
        });
    }

    mergeObjects(defenseId, attachedObjectId) {
        console.log(`merging defense ${defenseId} with ${attachedObjectId}`);
        return this.socket.request('mergeDefenses', {
            defenseId: defenseId,
            gameObjectId: attachedObjectId
        });
    }
}
