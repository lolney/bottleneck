import StaticActor from './StaticActor';

/**
 * Represents an Actor that can cycle through different sprites -
 * useful when different states require, eg, different filters, which can't be
 * represented simply with animation frames
 */
export default class MultiSpriteActor {
    constructor(avatar, renderer, resources) {
        this.currentIndex = 0;
        this.id = avatar.id;
        this.renderer = renderer;
        this.actors = resources.map(
            (resource) => new StaticActor(avatar, renderer, resource, false)
        );
    }

    getSprite() {
        return this.actors[this.currentIndex].sprite;
    }

    advanceSprites() {
        let sprite = this.getSprite();
        this.renderer.camera.removeChild(sprite);
        let nextIndex =
            this.currentIndex >= this.actors.length - 1
                ? 0
                : this.currentIndex + 1;
        this.setCurrentSprite(nextIndex);
    }

    setCurrentSprite(index) {
        this.currentIndex = index;
        let sprite = this.getSprite();
        this.renderer.sprites[this.id] = sprite;
        this.renderer.camera.addChild(sprite);
    }

    destroy(id, renderer) {
        for (const actor of this.actors) {
            actor.sprite.destroy();
        }
        delete renderer.sprites[id];
    }
}
