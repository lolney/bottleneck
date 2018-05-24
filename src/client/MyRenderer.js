'use strict';

import Renderer from 'lance/render/Renderer';
let PIXI = null;

export default class MyRenderer extends Renderer {

    get ASSETPATHS() {
        return {
            player: 'assets/sprites/walking.json',
            tree: 'assets/sprites/Rock1.png',
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

        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;

        this.layer1 = new PIXI.Container();
        // this.stage = new PIXI.Container();

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
                    this.setupStage();
                    this.gameEngine.emit('renderer.ready'); // TODO: client needs to listen for this?
                    resolve();
                });
        });
    }

    attachRenderer() {
        this.renderer = PIXI.autoDetectRenderer(this.viewportWidth, this.viewportHeight);
        document.body.querySelector('.pixiContainer').appendChild(this.renderer.view);
    }

    setupStage() {

    var app = this.renderer;
    document.body.appendChild(app.view);

    var texture = PIXI.Texture.fromImage('/assets/grass.jpg');

    var tilingSprite = new PIXI.extras.TilingSprite(
        texture,
        this.viewportWidth,
        this.viewportHeight
    );
    this.layer1.addChild(tilingSprite);

    }


    draw(t, dt) {
        super.draw(t, dt);
        for (let objId of Object.keys(this.sprites)) {
            let objData = this.gameEngine.world.objects[objId];
            let sprite = this.sprites[objId];

            if (objData) {
                if (objData.actor.handleDraw)
                    objData.actor.handleDraw(objData.position);
                sprite.x = objData.position.x;
                sprite.y = objData.position.y;
            }
        }
        this.renderer.render(this.layer1);
        // this.renderer.render(this.stage);


    }

}
