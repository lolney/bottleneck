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
        this.lastPosition = Object.assign({}, player.position);

        this.animate = false;
        this.sprite.animationSpeed = 0.25;

        // Store in the renderer and in PIXI's renderer
        renderer.sprites[player.id] = this.sprite;
        renderer.layer1.addChild(this.sprite);
    }

    handleDraw(position) {
        if (this.animate) {
            if (!this.moved(position)) {
                this.animate = false;
                this.sprite.gotoAndStop(0);
            }
        } else {
            if (this.moved(position)) {
                this.sprite.play();
                this.animate = true;
            }
        }
        this.lastPosition = Object.assign({}, position);
    }

    moved(position) {
        return this.lastPosition.x != position.x
            || this.lastPosition.y != position.y;
    }

    destroy(id, renderer) {
        if (this.sprite) {
            this.sprite.destroy();
            delete renderer.sprites[id];
        }
    }
}