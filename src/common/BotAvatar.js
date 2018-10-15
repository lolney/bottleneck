'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import PlayerActor from '../client/PlayerActor.js';
import Serializer from 'lance/serialize/Serializer';
import TwoVector from 'lance/serialize/TwoVector';

export const State = {
    COLLECTING: Symbol('collecting'),
    RETURNING: Symbol('returning'),
    LEAVING: Symbol('leaving'),
    AT_BASE: Symbol('at_base')
};

const Status = {
    IDLE: Symbol('idle'),
    WORKING: Symbol('working')
};

/**
 * Represents the state of resource collection bots
 * Note: not properly serialized
 */
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
        this.isCalculating = false;
        this.state = State.AT_BASE;
        this.class = BotAvatar;
        this.width = 25;
        this.height = 25;
        this.path = [];
    }

    blocks() {
        return false;
    }

    static distance(a, b) {
        return a
            .clone()
            .subtract(b)
            .length();
    }

    initResources() {
        let startingPosition = this.serverState.gameWorld.getStartingPosition(
            this.playerNumber
        );
        let resources = this.serverState.gameEngine.getResources(
            this.problemId
        );
        let distances = {};
        for (const resource of resources) {
            distances[resource.dbId] = BotAvatar.distance(
                startingPosition,
                resource.position
            );
        }
        return resources.sort((a, b) => distances[b.dbId] > distances[a.dbId]);
    }

    attach(controller, gameWorld, gameEngine) {
        console.log('attaching bot');

        this.serverState = {
            controller: controller,
            gameWorld: gameWorld,
            gameEngine: gameEngine
        };
        this.targetGameObject = null;
        this.serverState['resources'] = this.initResources();
        this.onPreStep = () => {
            this.followWaypoint();
        };
        gameEngine.on('preStep', this.onPreStep);
    }

    nextResource() {
        return this.serverState.resources.pop();
    }

    async followWaypoint() {
        await this.checkPath();
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

    /**
     * Returns a new path, transitioning state as necessary
     * If there are no more resources to be collected, returns []
     */
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
            return this.pathFind(
                this.serverState.gameWorld.getStartingPosition(
                    this.playerNumber
                )
            );
        } else if (this.state == State.AT_BASE) {
            // lookup closest unharvested resource
            let obj = this.nextResource();
            if (obj == undefined) {
                console.log('last resource reached');
                return [];
            }
            this.transitionState(obj);
            console.log(
                'Leaving base. position, target: ',
                this.position,
                obj.position
            );
            return this.pathFind(obj.position);
        } else {
            throw new Error(
                `Unexpected state for Bot: ${this.state.toString()}`
            );
        }
    }

    /**
     * Retun a path, if possible. Else, idle until new path can be found,
     * checking every second.
     * @param {TwoVector} dst -
     */
    pathFind(dst) {
        this.statis = Status.IDLE;
        return new Promise((resolve) => {
            let tryPath = () => {
                let path = this.serverState.gameWorld.pathfind(
                    this.position,
                    dst
                );
                if (path.length > 0) {
                    this.status = Status.RUNNING;
                    resolve(path);
                } else {
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
        switch (this.state) {
        case State.LEAVING:
            this.state = State.COLLECTING;
            break;
        case State.RETURNING:
            this.state = State.AT_BASE;
            this.serverState.controller.addToResourceCount(
                this.playerId,
                this.targetGameObject.dbId
            );
            this.targetGameObject = gameObject;
            break;
        case State.COLLECTING:
            this.state = State.RETURNING;
            this.serverState.gameEngine.markAsCollected(
                this.targetGameObject.dbId
            );
            break;
        case State.AT_BASE:
            if (gameObject == null) {
                throw new TypeError('Expected non-null gameObject');
            }
            this.targetGameObject = gameObject;
            this.state = State.LEAVING;
            break;
        default:
            throw new Error('Unexpected state');
        }
    }

    async checkPath() {
        if (this.path.length > 0) {
            let next = this.getNextPosition();
            let radius = 4;
            let distance = this.position
                .clone()
                .subtract(next)
                .length();
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
        this.path = [];
        if (this.targetGameObject != null) {
            this.serverState.resources.push(this.targetGameObject);
        }
        switch (this.state) {
        case State.LEAVING:
            this.state = State.AT_BASE;
            break;
        case State.RETURNING:
            this.state = State.COLLECTING;
            break;
        case State.COLLECTING:
        case State.AT_BASE:
            break;
        default:
            throw new Error('Unexpected state');
        }
        await this.checkPath();
    }

    detach() {
        this.serverState.gameEngine.removeObjectFromWorld(this.id);
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor = new PlayerActor(this, gameEngine.renderer, false);
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
        this.onPreStep = null;
    }
}
