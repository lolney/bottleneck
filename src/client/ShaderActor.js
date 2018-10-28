import Actor from './Actor';

let PIXI = null;

/**
 * Handles renderer-specific details for non-animated sprites
 */
export default class ShaderActor extends Actor {
    constructor(avatar, renderer, shader, shouldAttach = true) {
        super(avatar);
        PIXI = require('pixi.js');
        // Create the sprite
        var rect = new PIXI.Graphics();
        rect.drawRect(
            -avatar.width / 2,
            -avatar.height / 2,
            avatar.width,
            avatar.height
        );

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
        rect.filters = [myFilter];

        this.sprite.addChild(rect);

        // Store in the renderer and in PIXI's renderer
        if (shouldAttach === true) {
            this.attach(renderer, avatar);
        }
    }
}
