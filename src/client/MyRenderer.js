'use strict';

import Renderer from 'lance/render/Renderer';
let PIXI = null;

export default class MyRenderer extends Renderer {

    get ASSETPATHS() {
        return {
            player: 'assets/sprites/rightWalk2.png',
        };
    }

    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.sprites = {};
        this.isReady = false;
        PIXI = require('pixi.js');
    }

    init() {
        console.log(`init renderer`);
        this.layer1 = new PIXI.Container();
        this.attachRenderer();

        return new Promise((resolve, reject) => {
            PIXI.loader.add(Object.keys(this.ASSETPATHS).map((x) => {
                return {
                    name: x,
                    url: this.ASSETPATHS[x]
                };
            }))
                .load(() => {
                    console.log(`PIXI has loaded assets`);
                    this.isReady = true;
                    this.gameEngine.emit('renderer.ready'); // TODO: client needs to listen for this?
                    resolve();
                });
        });
    }

    attachRenderer() {
        this.renderer = PIXI.autoDetectRenderer(this.viewportWidth, this.viewportHeight);
        document.body.querySelector('.pixiContainer').appendChild(this.renderer.view);
    }

    draw(t, dt) {
        super.draw(t, dt);
        for (let objId of Object.keys(this.sprites)) {
            let objData = this.gameEngine.world.objects[objId];
            let sprite = this.sprites[objId];
            if (objData) {
                sprite.x = objData.position.x;
                sprite.y = objData.position.y;
            }
        }
        this.renderer.render(this.layer1);
    }

}
