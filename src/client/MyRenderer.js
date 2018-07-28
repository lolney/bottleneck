'use strict';

import Renderer from 'lance/render/Renderer';
import { WIDTH, HEIGHT } from '../common/MyGameEngine';
import TwoVector from 'lance/serialize/TwoVector';

let PIXI = null;

export default class MyRenderer extends Renderer {
    get ASSETPATHS() {
        return {
            player: 'assets/sprites/walking.json',
            tree: 'assets/sprites/Rock1.png',
            background: '/assets/grass.jpg',
            google: 'assets/sprites/tree1.png'
        };
    }

    constructor(gameEngine, clientEngine) {
        super(gameEngine, clientEngine);
        this.sprites = {};
        this.isReady = false;
        PIXI = require('pixi.js');
    }

    init() {
        console.log('init renderer');

        this.viewportWidth = window.innerWidth;
        this.viewportHeight = window.innerHeight;

        this.layer1 = new PIXI.Container();
        this.camera = new PIXI.Container();
        this.player = new PIXI.Container();

        this.attachRenderer();

        return new Promise((resolve, reject) => {
            PIXI.loader
                .add(
                    Object.keys(this.ASSETPATHS).map((x) => {
                        return {
                            name: x,
                            url: this.ASSETPATHS[x]
                        };
                    })
                )
                .load(() => {
                    console.log('PIXI has loaded assets');
                    this.isReady = true;
                    this.setupStage();
                    this.gameEngine.emit('renderer.ready'); // TODO: client needs to listen for this?
                    resolve();
                });
        });
    }

    canvasToWorldCoordinates(x, y) {
        let center = new TwoVector(
            this.viewportWidth / 2,
            this.viewportHeight / 2
        );
        return this.prev.clone().add(new TwoVector(x, y).subtract(center));
    }

    attachRenderer() {
        this.renderer = PIXI.autoDetectRenderer(
            this.viewportWidth,
            this.viewportHeight
        );
        document.body
            .querySelector('.pixiContainer')
            .appendChild(this.renderer.view);

        this.renderer.view.addEventListener('dragover', (ev) => {
            ev.preventDefault();
        });

        this.renderer.view.addEventListener('drop', (ev) => {
            let id = ev.dataTransfer.getData('text');
            let position = this.canvasToWorldCoordinates(
                ev.clientX,
                ev.clientY
            );
            this.gameEngine.makeDefence(id, position);
        });
    }

    setupStage() {
        let app = this.renderer;
        document.body.appendChild(app.view);

        let texture = PIXI.loader.resources.background.texture;

        let tilingSprite = new PIXI.extras.TilingSprite(texture, WIDTH, HEIGHT);
        this.camera.addChild(tilingSprite);
        this.layer1.addChild(this.camera);
    }

    moveCamera(position) {
        if (this.prev) {
            this.camera.x -= position.x - this.prev.x;
            this.camera.y -= position.y - this.prev.y;
            this.prev = position.clone();
        } else {
            this.camera.x += this.viewportWidth / 2 - position.x;
            this.camera.y += this.viewportHeight / 2 - position.y;
            this.prev = position.clone();
        }
    }

    draw(t, dt) {
        super.draw(t, dt);
        for (let objId of Object.keys(this.sprites)) {
            let objData = this.gameEngine.world.objects[objId];
            let sprite = this.sprites[objId];

            if (objData) {
                if (objData.actor.handleDraw)
                    objData.actor.handleDraw(objData.position);

                if (objData.actor.mainPlayer) {
                    this.moveCamera(objData.position);
                } else {
                    sprite.x = objData.position.x;
                    sprite.y = objData.position.y;
                }
            }

            this.renderer.render(this.layer1);
        }
    }
}
