let PIXI = null;

/**
 * Handles renderer-specific details for non-animated sprites
 */
export default class Actor {
    constructor(avatar) {
        PIXI = require('pixi.js');
        this.sprite = new PIXI.Container();
        if (avatar) {
            // Create the sprite
            this.sprite.position.set(avatar.position.x, avatar.position.y);
        }
    }

    attach(renderer, avatar) {
        renderer.sprites[avatar.id] = this.sprite;
        renderer.camera.addChild(this.sprite);
    }

    destroy(id, renderer) {
        if (this.sprite) {
            this.sprite.destroy();
            delete renderer.sprites[id];
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

    createSprite(resourceName) {
        let mySprite = new PIXI.Sprite(
            PIXI.loader.resources[resourceName].texture
        );
        mySprite.anchor.set(0.5, 0.5);
        return mySprite;
    }

    setShader(avatar, renderer, shader, sprite) {
        if (!sprite) {
            sprite = this.sprite;
        }

        let getAdustment = () => [renderer.camera.x, renderer.camera.y];
        let myFilter = new PIXI.Filter(
            null,
            shader, // fragment shader
            {
                time: { value: 0.0 },
                resolution: { value: [avatar.width, avatar.height] },
                adjustment: { value: getAdustment() }
            }
        );

        const fps = 60;
        const interval = 1000 / fps;
        renderer.gameEngine.on('preStep', () => {
            myFilter.uniforms.time += interval;
            myFilter.uniforms.adjustment = getAdustment();
        });
        sprite.filters = [myFilter];
    }

    getSprite() {
        return this.sprite;
    }
}
