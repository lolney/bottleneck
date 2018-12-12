let PIXI = null;

/**
 * Handles renderer-specific details for non-animated sprites
 */
export default class Actor {
    constructor(avatar) {
        PIXI = require('pixi.js');
        // Create the sprite
        this.sprite = new PIXI.Container();
        this.sprite.position.set(avatar.position.x, avatar.position.y);
    }

    attach(renderer, avatar) {
        renderer.sprites[avatar.id] = this.sprite;
        renderer.camera.addChild(this.sprite);
    }

    destroy(id, renderer) {
        if (this.sprite) {
            this.sprite.destroy();
            delete renderer.sprites[id];
        }
    }

    createSprite(resourceName) {
        let mySprite = new PIXI.Sprite(
            PIXI.loader.resources[resourceName].texture
        );
        mySprite.anchor.set(0.5, 0.5);
        return mySprite;
    }

    getSprite() {
        return this.sprite;
    }
}
