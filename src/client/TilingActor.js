import Actor from './Actor';

let PIXI = null;

/**
 * Handles renderer-specific details for tiling sprites
 */
export default class TilingActor extends Actor {
    constructor(avatar, renderer, resourceName) {
        super(avatar);
        PIXI = require('pixi.js');

        let texture = PIXI.loader.resources[resourceName].texture;
        let mySprite = new PIXI.extras.TilingSprite(
            texture,
            avatar.width,
            avatar.height
        );
        mySprite.anchor.set(0.5, 0.5);
        this.sprite.addChild(mySprite);

        this.attach(renderer, avatar);
    }
}
