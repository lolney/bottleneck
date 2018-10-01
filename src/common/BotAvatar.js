'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import AnimatedActor from '../client/AnimatedActor.js';
import Serializer from 'lance/serialize/Serializer';
import TwoVector from 'lance/serialize/TwoVector';

const State = {
    COLLECTING: Symbol('collecting'),
    RETURNING: Symbol('returning'),
    LEAVING: Symbol('leaving'),
    AT_BASE: Symbol('at_base')
};

export default class BotAvatar extends DynamicObject {
    static get netScheme() {
        return Object.assign({}, super.netScheme);
    }

    get maxSpeed() {
        return 1;
    }

    syncTo(other) {
        super.syncTo(other);
        // console.log(`syncing ${other}`);
    }

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
        this.position = position;
        this.velocity = velocity;
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props) {
            this.playerNumber = props.playerNumber;
            this.playerId = props.playerId;
            this.problemId = props.problemId;
            this.position = props.position;
            this.velocity = new TwoVector(0, 0);
        }
        this.isCalculating = false;
        this.state = State.AT_BASE;
        this.class = BotAvatar;
        this.width = 25;
        this.height = 25;
        this.path = [];
    }

    attach(controller, gameWorld, gameEngine) {
        console.log('attaching bot');
        this.serverState = {
            controller: controller,
            gameWorld: gameWorld,
            gameEngine: gameEngine
        };
        this.onPreStep = () => {
            this.followWaypoint();
        };
        gameEngine.on('preStep', this.onPreStep);
    }

    followWaypoint() {
        this.checkPath();
        if (this.path.length > 0) {
            let next = this.getNextPosition();
            // console.log(next, this.position);
            this.velocity = next
                .subtract(this.position)
                .normalize()
                .multiplyScalar(this.maxSpeed);
            // console.log(`setting velocity to ${this.velocity}`);
        } else this.velocity = new TwoVector(0, 0);
    }

    newPath() {
        if (this.state == State.COLLECTING) {
            this.transitionState();
            console.log(
                'Returning to base. position, base: ',
                this.position,
                this.serverState.gameWorld.getStartingPosition(
                    this.playerNumber
                )
            );
            return this.serverState.gameWorld.pathfind(
                this.position,
                this.serverState.gameWorld.getStartingPosition(
                    this.playerNumber
                )
            );
        } else if (this.state == State.AT_BASE) {
            // lookup closest unharvested resource
            let obj = this.serverState.gameEngine.closestResource(
                this.problemId
            );
            this.transitionState(obj.dbId);
            console.log(
                'Leaving base. position, target: ',
                this.position,
                obj.position
            );
            return this.serverState.gameWorld.pathfind(
                this.position,
                obj.position
            );
        } else {
            throw new Error(
                `Unexpected state for Bot: ${this.state.toString()}`
            );
        }
    }

    getNextPosition() {
        let next = this.path[0].split(',').map((e) => Number.parseFloat(e));
        return new TwoVector(next[0], next[1]);
    }

    /**
     * Transition the bot to its next state. Includes side effects.
     * @param {string} gameObjectId
     */
    transitionState(gameObjectId = null) {
        switch (this.state) {
        case State.LEAVING:
            this.state = State.COLLECTING;
            break;
        case State.RETURNING:
            this.state = State.AT_BASE;
            this.serverState.controller.addToResourceCount(
                this.playerId,
                this.targetGameObjectId
            );
            this.targetGameObjectId = gameObjectId;
            break;
        case State.COLLECTING:
            this.state = State.RETURNING;
            // TODO: mark resource as collected
            break;
        case State.AT_BASE:
            if (gameObjectId == null) {
                throw new TypeError('Expected non-null gameObjectId');
            }
            this.targetGameObjectId = gameObjectId;
            this.state = State.LEAVING;
            break;
        default:
            throw new Error('Unexpected state');
        }
    }

    checkPath() {
        if (this.path.length > 0) {
            let next = this.getNextPosition();
            let radius = 4;
            let distance = this.position
                .clone()
                .subtract(next)
                .length();
            // console.log('distance', distance, this.path.length);
            if (distance < radius) {
                this.path = this.path.slice(1, this.path.length);
                // console.log('culling path', this.path.length);
                if (this.path.length == 0) {
                    this.transitionState();
                }
            }
        }
        if (this.path.length == 0 && !this.isCalculating) {
            this.isCalculating = true;
            this.path = this.newPath();
            console.log('New path length:', this.path.length);
            this.checkPath();
            this.isCalculating = false;
        }
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor = new AnimatedActor(this, gameEngine.renderer, false);
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
