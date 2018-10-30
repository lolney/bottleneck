import BotAvatar from './BotAvatar';
import Serializer from 'lance/serialize/Serializer';

export const State = {
    COLLECTING: Symbol('collecting'),
    RETURNING: Symbol('returning'),
    LEAVING: Symbol('leaving'),
    AT_BASE: Symbol('at_base')
};

/**
 * Represents the state of resource collection bots
 * @unimplemented not properly serialized
 */
export default class CollectionBotAvatar extends BotAvatar {
    static get netScheme() {
        return Object.assign({}, super.netScheme);
    }

    get maxSpeed() {
        return 1;
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.state = State.AT_BASE;
        this.class = CollectionBotAvatar;
        this.width = 25;
        this.height = 25;
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
        super.attach(controller, gameWorld, gameEngine);

        this.targetGameObject = null;
        this.serverState['resources'] = this.initResources();
    }

    nextResource() {
        return this.serverState.resources.pop();
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

    async resetPath() {
        if (!this.isCalculating) {
            this.isCalculating = true;
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
            this.isCalculating = false;
            await this.checkPath();
        }
    }
}
