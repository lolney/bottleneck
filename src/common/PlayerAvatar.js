'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import PlayerActor from '../client/PlayerActor.js';
import Serializer from 'lance/serialize/Serializer';

export default class PlayerAvatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                playerNumber: { type: Serializer.TYPES.INT32 }
            },
            super.netScheme
        );
    }

    blocks() {
        return false;
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props && props.playerId) {
            this.playerId = props.playerId;
            this.playerNumber = props.playerNumber;
        }
        this.class = PlayerAvatar;
        this.width = 25;
        this.height = 25;
    }

    onAddToWorld(gameEngine) {
        console.log(`adding player ${this.id}`);
        if (gameEngine.renderer) {
            this.actor = new PlayerActor(
                this,
                gameEngine.renderer,
                'player',
                gameEngine.isOwnedByPlayer(this)
            );
        }
    }

    onRemoveFromWorld(gameEngine) {
        console.log(`removing player ${this.id}`);
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
