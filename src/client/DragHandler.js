import Router from './Router';
import { siegeItems } from '../config';
import DefenseAvatar from '../common/DefenseAvatar';
import BotAvatar from '../common/BotAvatar';

const DETACH_THRESHOLD = 50;

export default class DragHandler {
    constructor(canvas, gameEngine, renderer) {
        this.dragObject = null;
        this.gameEngine = gameEngine;
        this.renderer = renderer;

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
            this.dragObject.handleDrop(id);
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
        console.log('removing ', obj.dbId);

        this.gameEngine.removeObjectFromWorld(obj.id);
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
            console.log('attaching offensive item');
            if (this.attachedObject) {
                this.resetAttachedObject();
            }
            this.attachedObject = other;
            this.attachedObject.setLoading(this.id);
            this.gameObject.setPlacable(true);
            this.gameObject.position = other.position;
        };

        let gameObjectTest = (o) => o.id == gameObject.id;
        let otherObjectTest = (o) =>
            o instanceof DefenseAvatar &&
            o.behaviorType == 'defensive' &&
            !this.gameEngine.isOwnedByPlayer(o);

        this.gameEngine.registerCollisionStart(
            gameObjectTest,
            otherObjectTest,
            this.start
        );

        /* Can include, but keeps from showing loading status after drop
        this.nObjects = 0;

        this.stop = () => {
            this.nObjects--;
            if (this.nObjects == 0) {
                this.resetAttachedObject();
            } else if (this.nObjects < 0) {
                throw new Error(
                    `Collision stop, but this.nObjects is < 0: ${this.nObjects}`
                );
            }
        };

        this.gameEngine.registerCollisionStop(
            gameObjectTest,
            (o) => this.attachedObject && this.attachedObject.id == o.id,
            this.stop
        );*/
    }

    resetAttachedObject() {
        this.attachedObject.setLoading(false);
        this.attachedObject = null;
        this.gameObject.setPlacable(false);
    }

    update(position) {
        if (this.attachedObject) {
            if (
                BotAvatar.distance(this.attachedObject.position, position) >
                DETACH_THRESHOLD
            ) {
                this.resetAttachedObject();
            }
        }
        this.gameObject.position = position;
    }

    handleDrop(id) {
        [this.start, this.stop].forEach((fn) =>
            this.gameEngine.removeListener(fn)
        );
        if (this.attachedObject != null) {
            Router.mergeObjects(id, this.attachedObject.id);
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

    handleDrop(id) {
        Router.makeDefense(id, this.gameObject.position);
    }
}
