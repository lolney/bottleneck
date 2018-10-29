import BotAvatar from './BotAvatar';
import Serializer from 'lance/serialize/Serializer';

export const State = {
    AT_ENEMY_BASE: Symbol('at_enemy_base'),
    ASSAULTING: Symbol('assaulting'),
    AT_BASE: Symbol('at_base')
};

/**
 * Represents the state of resource collection bots
 * @unimplemented not properly serialized
 */
export default class AssaultBotAvatar extends BotAvatar {
    static get netScheme() {
        return Object.assign({}, super.netScheme);
    }

    get maxSpeed() {
        return 1;
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props) {
            this.opponentPlayerId = props.opponentPlayerId;
        }
        // @TODO: this may have to be set in props (if playerNumber is not one of these)
        this.opponentPlayerNumber = this.playerNumber == 1 ? 2 : 1;
        this.state = State.AT_BASE;
        this.class = AssaultBotAvatar;
        this.width = 25;
        this.height = 25;
    }

    /**
     * Returns a new path, transitioning state as necessary
     * If there are no more resources to be collected, returns []
     */
    async newPath() {
        if (this.state == State.AT_BASE) {
            this.transitionState();
            let enemyBasePosition = this.serverState.gameWorld.getStartingPosition(
                this.opponentPlayerNumber
            );
            console.log(
                'Leaving base. position, target: ',
                this.position,
                enemyBasePosition
            );
            return this.pathFind(enemyBasePosition);
        } else if (this.state == State.AT_ENEMY_BASE) {
            this.transitionState();
            console.log(
                'Reaching and assaulted enemy base. position: ',
                this.position
            );
            return [];
        } else {
            throw new Error(
                `Unexpected state for Bot: ${this.state.toString()}`
            );
        }
    }

    /**
     * Transition the bot to its next state. Includes side effects.
     */
    transitionState() {
        switch (this.state) {
        case State.ASSAULTING:
            this.state = State.AT_ENEMY_BASE;
            break;
        case State.AT_ENEMY_BASE:
            this.serverState.controller.doAssault(this.opponentPlayerId);
            break;
        case State.AT_BASE:
            this.state = State.ASSAULTING;
            break;
        default:
            throw new Error('Unexpected state');
        }
    }

    async resetPath() {
        if (!this.isCalculating) {
            this.isCalculating = true;
            this.path = [];
            switch (this.state) {
            case State.ASSAULTING:
                this.state = State.AT_BASE;
                break;
            case State.AT_ENEMY_BASE:
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
