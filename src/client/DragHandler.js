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

            console.log('dragleave');
            this.removeTempObject();
        });

        canvas.addEventListener('drop', (ev) => {
            // Prevent opening a new tab on Firefox
            ev.preventDefault();

            console.log('drop');
            this.updateTempObject(ev);
            Router.makeDefence(this.dragObject.dbId, this.dragObject.position);
            this.removeTempObject();
            /*
            this.dragObject.actor.getSprite().filters = [];
            this.dragObject = null;*/
        });
    }

    updateTempObject(ev) {
        // TODO: distinguish between defence types
        // let id = ev.dataTransfer.getData('text');
        let position = this.renderer.canvasToWorldCoordinates(
            ev.clientX,
            ev.clientY
        );
        if (this.dragObject == null) {
            this.dragObject = this.gameEngine.makeDefence(null, position);
            let filter = new PIXI.filters.ColorMatrixFilter();
            this.dragObject.actor.getSprite().filters = [filter];
            filter.negative();
        } else {
            this.dragObject.position = position;
        }
    }

    removeTempObject() {
        let obj = this.dragObject;
        this.gameEngine.removeObjectFromWorld(obj.id);
        this.dragObject = null;
    }
}
