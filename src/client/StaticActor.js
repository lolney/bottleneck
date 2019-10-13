import Actor from './Actor';

let PIXI = null;

/**
 * Handles renderer-specific details for non-animated sprites
 */
export default class StaticActor extends Actor {
    constructor(avatar, renderer, resourceName, shouldAttach = true) {
        super(avatar);
        PIXI = require('pixi.js');
        // Create the sprite
        this.mySprite = this.createSprite(resourceName);
        this.sprite.addChild(this.mySprite);

        // Store in the renderer and in PIXI's renderer
        if (shouldAttach === true) {
            this.attach(renderer, avatar);
        }
    }

    setAnchor(x, y) {
        this.mySprite.anchor.set(x, y);
    }

    scale(factor) {
        this.mySprite.scale.set(factor, factor);
    }

    setPlacable(set) {
        if (!set) {
            this.placableFilter = new PIXI.filters.ColorMatrixFilter();
            this.placableFilter.negative();
            this.sprite.filters = [this.placableFilter];
        } else if (this.placableFilter) {
            this.sprite.filters = [];
        }
    }
}
