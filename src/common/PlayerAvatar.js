'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';

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
            gameEngine.renderer.addSprite(this, 'player');
        }
    }

}
