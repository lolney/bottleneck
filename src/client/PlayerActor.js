let PIXI = null;

export default class PlayerActor {

    constructor() {
        PIXI = require('pixi.js');
        this.sprite = new PIXI.Container();
        let playerSprite = new PIXI.Sprite(PIXI.loader.resources.player.texture);
        this.sprite.addChild(playerSprite);
    }
}