import Actor from './Actor';
import TilingActor from './TilingActor';

let PIXI = null;

export default class ShaderActor extends Actor {
    constructor(
        avatar,
        renderer,
        shader,
        shouldAttach = true,
        resource = 'dirt'
    ) {
        super(avatar);
        PIXI = require('pixi.js');

        // Create a tiling sprite
        this.tilingActor = new TilingActor(avatar, renderer, resource);

        // Create the sprite
        var rect = new PIXI.Graphics();
        rect.drawRect(
            -avatar.width / 2 + 4,
            -avatar.height / 2 + 4,
            avatar.width - 8,
            avatar.height - 8
        );

        this.setShader(avatar, renderer, shader, rect);
        this.sprite.addChild(rect);

        // Store in the renderer and in PIXI's renderer
        if (shouldAttach === true) {
            this.attach(renderer, avatar);
        }
    }

    destroy(id, renderer) {
        super.destroy(id, renderer);
        this.tilingActor.sprite.destroy();
    }
}
