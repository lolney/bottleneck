'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import PlayerActor from '../client/PlayerActor.js';
import BaseTypes from 'lance/serialize/BaseTypes';
import Slowable from './Slowable';
import { Player } from '../config';
import BotAvatar from './BotAvatar.js';
import TwoVector from 'lance/serialize/TwoVector';

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

    moveTo(gameEngine, destination) {
        // cancel prev moves to
        if (this.currentMoveTo) {
            this.currentMoveTo.cancel();
        }
        this.currentMoveTo = new MoveTo(this, gameEngine, destination);
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

class MoveTo {
    constructor(object, gameEngine, destination) {
        this.gameEngine = gameEngine;
        this.object = object;
        this.destination = destination;

        this.cancel = this.cancel.bind(this);

        this.onPreStep = () => {
            this.followWaypoint();
        };
        gameEngine.on('preStep', this.onPreStep);

        // setup listeners for collision detection, arrow key movement
        gameEngine.registerCollisionStart(
            (o1) => o1 === object,
            (o2) => o2 !== object && o2.blocks,
            this.cancel
        );
        gameEngine.on('processInput', this.cancel);

        // set velocity to speed * (click - position)/dst
        this.velocity = BotAvatar.moveTowardsWaypoint(
            object.position,
            destination,
            object.speed
        );
    }

    followWaypoint() {
        const distance = BotAvatar.distance(
            this.object.position,
            this.destination
        );

        if (distance < 5) {
            this.cancel();
        } else {
            const prevPosition = this.object.position.clone();
            this.object.position = this.object.position.add(this.velocity);

            const shouldRevert = this.gameEngine.causesCollision();
            if (shouldRevert) {
                this.object.position = prevPosition;
            }
        }
    }

    cancel() {
        // cancel listeners for collision detection, arrow key movement
        this.gameEngine.removeListener('preStep', this.onPreStep);
        this.gameEngine.removeListener('processInput', this.cancel);
        this.gameEngine.removeCollisionStart(this.cancel);
    }
}
