'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import PlayerActor from '../client/PlayerActor.js';
import Serializer from 'lance/serialize/Serializer';
import TwoVector from 'lance/serialize/TwoVector';
import Slowable from './Slowable';

export const Status = {
    IDLE: Symbol('idle'),
    WORKING: Symbol('working'),
    SHUTDOWN: Symbol('shutdown')
};

const radius = 4;

/**
 * Base class for bots, representing syncing, pathfinding,
 * and waypoint following
 */
export default class BotAvatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            { playerNumber: { type: Serializer.TYPES.INT32 } },
            super.netScheme
        );
    }

    get maxSpeed() {
        return 5;
    }

    syncTo(other) {
        super.syncTo(other);
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
        this.resource = 'bot';
        this.speed = this.maxSpeed;
        this.isCalculating = false;
        this.class = BotAvatar;
        this.path = [];
    }

    get blocks() {
        return false;
    }

    get isKeyObject() {
        return true;
    }

    static distance(a, b) {
        return a
            .clone()
            .subtract(b)
            .length();
    }

    attach(controller, gameWorld, gameEngine) {
        console.log('attaching bot');

        this.status = Status.WORKING;
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

    async followWaypoint() {
        await this.checkPath();
        if (this.path.length > 0) {
            let next = this.getNextPosition();
            // console.log(next, this.position);
            this.velocity = next
                .subtract(this.position)
                .normalize()
                .multiplyScalar(this.speed);
            // console.log(`setting velocity to ${this.velocity}`);
        } else this.velocity = new TwoVector(0, 0);
    }

    /**
     * Returns a new path, transitioning state as necessary
     * If there are no more resources to be collected, returns []
     */
    async newPath() {
        // @TODO: consider making this generic with a newPath function
        // for each state transition
        return ['0,0'];
    }

    /**
     * Retun a path, if possible. Else, idle until new path can be found,
     * checking every second.
     * @param {TwoVector} dst -
     */
    pathFind(dst) {
        this.status = Status.IDLE;
        return new Promise((resolve) => {
            let tryPath = () => {
                let path = this.serverState.gameWorld.pathfind(
                    this.position,
                    dst
                );
                if (path.length > 0) {
                    this.status = Status.WORKING;
                    resolve(path);
                } else if (this.status != Status.SHUTDOWN) {
                    console.log('Trying to pathfind again');
                    this.status = Status.IDLE;
                    setTimeout(tryPath, 1000);
                }
            };
            tryPath();
        });
    }

    getNextPosition() {
        let next = this.path[0].split(',').map((e) => Number.parseFloat(e));
        return new TwoVector(next[0], next[1]);
    }

    /**
     * Transition the bot to its next state. Includes side effects.
     * @param {gameObject} gameObject
     */
    transitionState(gameObject = null) {
        // @TODO: consider making this generic, subclasses providing
        // state transition rules and callbacks
    }

    async checkPath() {
        if (this.path.length > 0) {
            let next = this.getNextPosition();
            let distance = BotAvatar.distance(this.position, next);

            if (distance < radius) {
                // trim path
                this.path = this.path.slice(1, this.path.length);
                if (this.path.length == 0) {
                    this.transitionState();
                }
            }
        }
        if (this.path.length == 0 && !this.isCalculating) {
            this.isCalculating = true;
            this.path = await this.newPath();
            console.log('New path length:', this.path.length);
            if (this.path.length == 0) {
                this.detach();
                return;
            }
            this.checkPath();
            this.isCalculating = false;
        }
    }

    async resetPath() {
        // @TODO: consider making this generic, subclasses providing
        // reverse state transition rules
    }

    detach() {
        console.log('Bot detaching');
        this.serverState.gameEngine.removeObjectFromWorld(this.id);
    }

    onAddToWorld(gameEngine) {
        this.behaviors = [new Slowable(gameEngine, this)];
        if (gameEngine.renderer) {
            this.actor = new PlayerActor(
                this,
                gameEngine.renderer,
                this.resource,
                false
            );
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (this.behaviors) {
            for (const behavior of this.behaviors) {
                behavior.onRemove(gameEngine);
            }
        }
        this.status = Status.SHUTDOWN;
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
        this.onPreStep = null;
    }
}
