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

    attach(gameWorld, gameEngine) {
        console.log('attaching bot');
        this.onPreStep = () => {
            this.followWaypoint(gameWorld, gameEngine);
        };
        gameEngine.on('preStep', this.onPreStep);
    }

    followWaypoint(gameWorld, gameEngine) {
        this.checkPath(gameWorld, gameEngine);
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

    newPath(gameWorld, gameEngine) {
        if (this.state == State.COLLECTING) {
            this.state = State.RETURNING;
            console.log(
                'Returning to base. position, base: ',
                this.position,
                gameWorld.getStartingPosition(this.playerId)
            );
            return gameWorld.pathfind(
                this.position,
                gameWorld.getStartingPosition(this.playerId)
            );
        } else if (this.state == State.AT_BASE) {
            this.state = State.LEAVING;
            // lookup closest unharvested resource
            let obj = gameEngine.closestResource(this.problemId);
            console.log(
                'Leaving base. position, target: ',
                this.position,
                obj.position
            );
            return gameWorld.pathfind(this.position, obj.position);
        } else {
            throw new Error('Unexpected state for Bot');
        }
    }

    getNextPosition() {
        let next = this.path[0].split(',').map((e) => Number.parseFloat(e));
        return new TwoVector(next[0], next[1]);
    }

    setDone() {
        if (this.state == State.LEAVING) {
            this.state = State.COLLECTING;
        } else {
            this.state = State.AT_BASE;
        }
    }

    checkPath(gameWorld, gameEngine) {
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
                    this.setDone();
                }
            }
        }
        if (this.path.length == 0 && !this.isCalculating) {
            this.isCalculating = true;
            this.path = this.newPath(gameWorld, gameEngine);
            console.log('New path length:', this.path.length);
            this.checkPath(gameWorld, gameEngine);
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
