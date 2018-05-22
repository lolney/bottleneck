let PIXI = null;

/** 
 * Handles renderer-specific details for player
 */
export default class PlayerActor {

    constructor(player, renderer) {
        PIXI = require('pixi.js');
        // Create the sprite
        let frames = [];

        for (let i = 0; i < 3; i++) {
            frames.push(PIXI.Texture.fromFrame(i));
        }

        this.sprite = new PIXI.extras.AnimatedSprite(frames);

        this.sprite.x = player.position.x;
        this.sprite.y = player.position.y;
        this.sprite.animationSpeed = 0.25;

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