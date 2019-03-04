import Actor from './Actor';

let PIXI = null;

/**
 * Handles renderer-specific details for player
 */
export default class AnimatedActor extends Actor {
    /**
     *
     * @param {GameObject} avatar - corresponding GameObject
     * @param {Renderer} renderer
     * @param {string} resource - name of the resource loaded by PIXI loader
     * @param {number} animationSpeed - amount to scale animation speed (normally 1)
     * @param {boolean} shouldAdd - if true, add to the renderer's camera
     */
    constructor(avatar, renderer, resource, animationSpeed, shouldAdd = false) {
        super();

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
            this.attach(renderer, avatar);
        }
    }

    togglePlay() {
        if (this.animate) {
            this.sprite.gotoAndStop(0);
        } else {
            this.sprite.play();
        }
        this.animate = !this.animate;
    }

    playOnce(index) {
        index = index === undefined ? 0 : index;

        this.sprite.onLoop = () => {
            let nframes = this.sprite._textures.length;
            let stop = (nframes + index) % nframes;

            this.sprite.gotoAndStop(stop);
            this.sprite.onLoop = null;
        };
        this.sprite.play();
    }
}
