import Router from './Router';

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
            let position = this.renderer.canvasToWorldCoordinates(
                ev.clientX,
                ev.clientY
            );
            Router.makeDefence(id, position);
            this.removeTempObject();
            /*
            this.dragObject.actor.getSprite().filters = [];
            this.dragObject = null;*/
        });
    }

    getId(ev) {
        let id = null;
        for (const candidate of [0, 1, 2, 3, 4, 5].map((i) => i.toString())) {
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

    // TODO
    updateTempObject(ev) {
        let position = this.renderer.canvasToWorldCoordinates(
            ev.clientX,
            ev.clientY
        );

        let id = this.getId(ev);
        if (this.dragObject == null) {
            this.dragObject = this.gameEngine.makeDefence(id, position);
            let filter = new PIXI.filters.ColorMatrixFilter();
            this.dragObject.actor.getSprite().filters = [filter];
            filter.negative();
        } else {
            this.dragObject.position = position;
        }
    }

    removeTempObject() {
        let obj = this.dragObject;
        console.log('removing ', obj.dbId);

        this.gameEngine.removeObjectFromWorld(obj.id);
        this.dragObject = null;
    }
}
