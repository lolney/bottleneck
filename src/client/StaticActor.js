let PIXI = null;

/** 
 * Handles renderer-specific details for non-animated sprites
 */
export default class StaticActor {

    constructor(avatar, renderer, resourceName) {
        PIXI = require('pixi.js');
        // Create the sprite
        this.sprite = new PIXI.Container();
        this.sprite.position.set(avatar.position.x, avatar.position.y);
        let mySprite = new PIXI.Sprite(PIXI.loader.resources[resourceName].texture);
        this.sprite.addChild(mySprite);

        // Store in the renderer and in PIXI's renderer
        renderer.sprites[avatar.id] = this.sprite;
        renderer.layer1.addChild(this.sprite);
    }

    destroy(id, renderer) {
        if (this.sprite) {
            this.sprite.destroy();
            delete renderer.sprites[id];
        }
    }
}
