let PIXI = null;

/**
 * Handles renderer-specific details for player
 */
export default class AnimatedActor {
    /**
     *
     * @param {GameObject} avatar - corresponding GameObject
     * @param {Renderer} renderer
     * @param {string} resource - name of the resource loaded by PIXI loader
     * @param {number} animationSpeed - amount to scale animation speed (normally 1)
     * @param {boolean} shouldAdd - if true, add to the renderer's camera
     */
    constructor(avatar, renderer, resource, animationSpeed, shouldAdd = false) {
        PIXI = require('pixi.js');
        // Create the sprite
        let sheet = PIXI.loader.resources[resource].spritesheet;

        this.sprite = new PIXI.extras.AnimatedSprite(
            Object.values(sheet.textures)
        );

        this.sprite.anchor.set(0.5, 0.5);

        this.sprite.animationSpeed = animationSpeed;
        this.animate = false;

        if (shouldAdd) {
            renderer.camera.addChild(this.sprite);
        }
        // Store in the renderer and in PIXI's renderer
        renderer.sprites[avatar.id] = this.sprite;

        window.setTimeout(() => this.playOnce(), 1000);
    }

    togglePlay() {
        if (this.animate) {
            this.sprite.gotoAndStop(0);
        } else {
            this.sprite.play();
        }
        this.animate = !this.animate;
    }

    playOnce() {
        this.sprite.onLoop = () => {
            // let nframes = this.sprite._textures.length;
            this.sprite.gotoAndStop(0);
            this.sprite.onLoop = null;
        };
        this.sprite.play();
    }

    destroy(id, renderer) {
        if (this.sprite) {
            this.sprite.destroy();
            delete renderer.sprites[id];
        }
    }
}
