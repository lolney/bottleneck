import Actor from './Actor';

let PIXI = null;

/**
 * Handles renderer-specific details for non-animated sprites
 */
export default class StaticActor extends Actor {
    constructor(avatar, renderer, resourceName, shouldAttach = true) {
        super(avatar, renderer, resourceName);
        PIXI = require('pixi.js');
        // Create the sprite
        let mySprite = new PIXI.Sprite(
            PIXI.loader.resources[resourceName].texture
        );
        mySprite.anchor.set(0.5, 0.5);
        this.sprite.addChild(mySprite);

        // Store in the renderer and in PIXI's renderer
        if (shouldAttach === true) {
            this.attach(renderer, avatar);
        }
    }
}
