'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import AnimatedActor from '../client/AnimatedActor.js';
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

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props && props.playerId) {
            console.log(typeof props.playerNumber);
            this.playerId = props.playerId;
            this.playerNumber = props.playerNumber;
        }
        this.class = PlayerAvatar;
        this.width = 25;
        this.height = 25;
    }

    syncTo(other) {
        console.log(this.position, other.position);
        super.syncTo(other);
    }

    onAddToWorld(gameEngine) {
        console.log(`adding player ${this.id}`);
        if (gameEngine.renderer) {
            console.log(
                `is owned by player: ${gameEngine.isOwnedByPlayer(this)} ${
                    gameEngine.playerId
                } ${this.playerNumber}`
            );
            this.actor = new AnimatedActor(
                this,
                gameEngine.renderer,
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
