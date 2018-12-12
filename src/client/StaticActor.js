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
        let mySprite = this.createSprite(resourceName);
        this.sprite.addChild(mySprite);

        // Store in the renderer and in PIXI's renderer
        if (shouldAttach === true) {
            this.attach(renderer, avatar);
        }
    }

    compositeSprite(resource) {
        let newSprite = this.createSprite(resource);
        this.sprite.addChild(newSprite);
    }

    setLoading(set = true, resource = null) {
        if (set) {
            this.loadingSprite = this.createSprite(resource);
            this.loadingSprite.filters = [new PIXI.filters.AlphaFilter(0.6)];
            this.sprite.addChild(this.loadingSprite);
        } else if (this.loadingSprite) {
            this.sprite.removeChild(this.loadingSprite);
            this.loadingSprite = null;
        }
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
