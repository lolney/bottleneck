'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import PlayerActor from '../client/PlayerActor.js';

export default class PlayerAvatar extends DynamicObject {

    static get netScheme() {
        return Object.assign({
            // add serializable properties here
        }, super.netScheme);
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props && props.playerId) {
            this.playerId = props.playerId;
        }
        this.class = PlayerAvatar;
    };

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            let actor = new PlayerActor();
            let sprite = actor.sprite;
            sprite.position.set(this.position.x, this.position.y);
            gameEngine.renderer.sprites[this.id] = sprite;
            gameEngine.renderer.layer1.addChild(sprite);
        }
    }

    onRemoveFromWorld(gameEngine) {
        console.log(`removing player ${this.id}`)
        if (gameEngine.renderer) {
            let sprite = gameEngine.renderer.sprites[this.id];
            if (sprite) {
                sprite.destroy();
                delete gameEngine.renderer.sprites[this.id];
            }
        }
    }

}
