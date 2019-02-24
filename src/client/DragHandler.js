import {
    siegeItems,
    getSiegeItemFromName,
    getSiegeItemFromId
} from '../config';
import DefenseAvatar from '../common/DefenseAvatar';
import BotAvatar from '../common/BotAvatar';
import WallAvatar from '../common/WallAvatar';

const DETACH_THRESHOLD = 100;

export default class DragHandler {
    constructor(canvas, gameEngine, renderer) {
        this.dragObject = null;
        this.gameEngine = gameEngine;
        this.renderer = renderer;

        canvas.addEventListener('dragenter', (event) => {
            event.preventDefault();
        });

        canvas.addEventListener('dragover', (ev) => {
            ev.preventDefault();

            this.updateTempObject(ev);
        });

        canvas.addEventListener('dragleave', (ev) => {
            ev.preventDefault();

            this.removeTempObject();
        });

        canvas.addEventListener('drop', (ev) => {
            // Prevent opening a new tab on Firefox
            ev.preventDefault();

            this.updateTempObject(ev);
            let id = ev.dataTransfer.getData('text/plain');
            this.dragObject.handleDrop(renderer.clientEngine.router, id);
            this.removeTempObject();
        });
    }

    getId(ev) {
        let id = null;
        for (const candidate of siegeItems.map((elem) => elem.id)) {
            if (ev.dataTransfer.types.includes(candidate)) {
                id = candidate;
                break;
            }
        }
        if (id == null) {
            throw new Error('couldn\'t find id');
        }
        return id;
    }

    static snapToGrid(vec) {
        let out = vec.clone();
        out.x = Math.floor(out.x / 20) * 20;
        out.y = Math.floor(out.y / 20) * 20;
        return out;
    }

    updateTempObject(ev) {
        let position = this.renderer.canvasToWorldCoordinates(
            ev.clientX,
            ev.clientY
        );

        position = DragHandler.snapToGrid(position);

        if (this.dragObject == null) {
            let id = this.getId(ev);
            this.createDragObject(id, position);
        } else {
            this.dragObject.update(position);
        }
    }

    createDragObject(id, position) {
        let gameObject = this.gameEngine.makeDefense(id, position);
        this.dragObject = (() => {
            switch (gameObject.behaviorType) {
            case 'defensive':
                return new DefensiveDragObject(this.gameEngine, gameObject);
            case 'offensive':
                return new OffensiveDragObject(this.gameEngine, gameObject);
            default:
                throw new Error(
                    `Invalid siege object class: ${gameObject.behaviorType}`
                );
            }
        })();
    }

    removeTempObject() {
        let obj = this.dragObject.gameObject;

        this.gameEngine.removeObjectFromWorld(obj.id);
        this.dragObject.removed = true;
        this.dragObject = null;
    }
}

class OffensiveDragObject {
    constructor(gameEngine, gameObject) {
        this.gameEngine = gameEngine;
        this.id = gameObject.dbId;
        this.gameObject = gameObject;
        this.attachedObject = null;

        this.gameObject.setPlacable(false);

        this.start = (_, other) => {
            if (other.isCountered() || !this.countersItem(other)) {
                return;
            }
            if (!this.attachedObjects[other.id]) {
                this.attachedObjects[other.id] = other;
            }
        };

        let gameObjectTest = (o) => o.id == gameObject.id;
        let otherObjectTest = (o) =>
            (o instanceof DefenseAvatar && o.behaviorType == 'defensive') ||
            o instanceof WallAvatar;
        // Can prevent players from placing on their own defences
        // && !this.gameEngine.isOwnedByPlayer(o);

        this.gameEngine.registerCollisionStart(
            gameObjectTest,
            otherObjectTest,
            this.start
        );

        // Can include, but keeps from showing loading status after drop
        this.attachedObjects = {};

        this.stop = (_, object) => {
            if (object == this.attachedObject && !this.removed) {
                this.resetAttachedObject();
            }
            delete this.attachedObjects[object.id];
        };

        this.gameEngine.registerCollisionStop(
            gameObjectTest,
            (o) => this.attachedObjects[o.id],
            this.stop
        );
    }

    countersItem(object) {
        const myItem = getSiegeItemFromName(this.gameObject.objectType);
        return myItem.counters.includes(object.objectType);
    }

    resetAttachedObject() {
        this.attachedObject.setLoading(false);
        this.attachedObject = null;
        this.gameObject.setPlacable(false);
    }

    initObject(other) {
        this.attachedObject = other;
        this.attachedObject.setLoading(this.id);
        this.gameObject.setPlacable(true);
        this.gameObject.position = other.position;
    }

    findClosestObject(position) {
        let min = null;
        let minDistance = null;

        for (const object of Object.values(this.attachedObjects)) {
            const distance = BotAvatar.distance(object.position, position);
            if (min == null || distance < minDistance) {
                min = object;
                minDistance = distance;
            }
        }

        return min;
    }

    update(position) {
        let closest = this.findClosestObject(position);
        if (closest) {
            if (this.attachedObject) {
                if (this.attachedObject != closest) {
                    this.resetAttachedObject();
                    this.initObject(closest);
                }
            } else {
                this.initObject(closest);
            }
        }

        if (
            this.attachedObject &&
            BotAvatar.distance(this.attachedObject.position, position) >
                DETACH_THRESHOLD
        ) {
            this.resetAttachedObject();
        }
        this.gameObject.position = position;
    }

    handleDrop(router, id) {
        [this.start, this.stop].forEach((fn) =>
            this.gameEngine.removeListener(fn)
        );
        if (this.attachedObject != null) {
            this.attachedObject.setLoading(this.id);
            router.mergeObjects(id, this.attachedObject.id);
        }
    }
}

class DefensiveDragObject {
    constructor(gameEngine, gameObject) {
        this.gameEngine = gameEngine;
        this.gameObject = gameObject;
    }

    update(position) {
        this.gameObject.position = position;
    }

    handleDrop(router, id) {
        router.makeDefense(id, this.gameObject.position);
    }
}
