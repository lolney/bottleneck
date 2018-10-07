import AnimatedActor from './AnimatedActor';

let PIXI = null;

/**
 * Handles renderer-specific details for player
 */
export default class PlayerActor extends AnimatedActor {
    constructor(avatar, renderer, mainPlayer) {
        super(avatar, renderer, 'player', 0.25);
        PIXI = require('pixi.js');

        this.lastPosition = Object.assign({}, avatar.position);

        this.animate = false;
        this.mainPlayer = mainPlayer;

        // Store in the renderer and in PIXI's renderer
        if (!mainPlayer) {
            this.sprite.x = avatar.position.x;
            this.sprite.y = avatar.position.y;
            renderer.camera.addChild(this.sprite);
        } else {
            this.sprite.x = renderer.viewportWidth / 2;
            this.sprite.y = renderer.viewportHeight / 2;
            renderer.layer1.addChild(this.sprite);
        }
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
        return (
            this.lastPosition.x != position.x ||
            this.lastPosition.y != position.y
        );
    }
}
