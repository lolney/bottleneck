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
            this.dragObject.actor.sprite.filters = [];
            this.dragObject = null;
        });
    }

    updateTempObject(ev) {
        let id = ev.dataTransfer.getData('text');
        let position = this.renderer.canvasToWorldCoordinates(
            ev.clientX,
            ev.clientY
        );
        if (this.dragObject == null) {
            this.dragObject = this.gameEngine.makeDefence(id, position);
            let filter = new PIXI.filters.ColorMatrixFilter();
            this.dragObject.actor.sprite.filters = [filter];
            filter.negative();
        } else {
            this.dragObject.position = position;
        }
    }

    removeTempObject() {
        this.gameEngine.removeObjectFromWorld(this.dragObject.id);
        this.dragObject = null;
    }
}
