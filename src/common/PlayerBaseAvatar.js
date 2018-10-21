'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import Serializer from 'lance/serialize/Serializer';
import StaticActor from '../client/StaticActor.js';
import { playerBase } from '../config';

export default class PlayerBaseAvatar extends DynamicObject {
    static get netScheme() {
        return Object.assign({}, super.netScheme);
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props) {
            this.playerNumber = this.playerNumber;
            this.playerId = this.playerId;
        }
        this.class = PlayerBaseAvatar;
        this.width = playerBase.width;
        this.height = playerBase.height;
    }

    blocks() {
        return false;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor = new StaticActor(
                this,
                gameEngine.renderer,
                playerBase.image
            );
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
