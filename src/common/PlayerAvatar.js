'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import PlayerActor from '../client/PlayerActor.js';
import BaseTypes from 'lance/serialize/BaseTypes';
import Slowable from './Slowable';
import { Player } from '../config';

export default class PlayerAvatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                playerNumber: { type: BaseTypes.TYPES.INT32 }
            },
            super.netScheme
        );
    }

    /**
     * Overriding bendToCurrent to maintain position, velocity from server
     */
    bendToCurrent(original, percent, worldSettings, isLocal, increments) {
        let position = this.position.clone();
        let velocity = this.velocity.clone();
        super.bendToCurrent(
            original,
            percent,
            worldSettings,
            isLocal,
            increments
        );
        // Only do this if not the main player
        if (this.actor && !this.actor.mainPlayer) {
            this.position = position;
            this.velocity = velocity;
        }
    }

    get maxSpeed() {
        return 5;
    }

    get isKeyObject() {
        return true;
    }

    get blocks() {
        return false;
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props && props.playerId) {
            this.playerId = props.playerId;
            this.playerNumber = props.playerNumber;
        }
        this.class = PlayerAvatar;
        this.width = Player.width;
        this.height = Player.height;
        this.speed = this.maxSpeed;
    }

    onAddToWorld(gameEngine) {
        console.log(`adding player ${this.id}`);
        this.behaviors = [new Slowable(gameEngine, this)];
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
        for (const behavior of this.behaviors) {
            behavior.onRemove(gameEngine);
        }
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
