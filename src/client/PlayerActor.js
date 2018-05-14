let PIXI = null;

/** 
 * Handles renderer-specific details for player
 */
export default class PlayerActor {

    constructor(player, renderer) {
        PIXI = require('pixi.js');
        // Create the sprite
        this.sprite = new PIXI.Container();
        this.sprite.position.set(player.position.x, player.position.y);
        let playerSprite = new PIXI.Sprite(PIXI.loader.resources.player.texture);
        this.sprite.addChild(playerSprite);

        // Store in the renderer and in PIXI's renderer
        renderer.sprites[player.id] = this.sprite;
        renderer.layer1.addChild(this.sprite);
    }

    destroy(id, renderer) {
        if (this.sprite) {
            this.sprite.destroy();
            delete renderer.sprites[id];
        }
    }
}