import DynamicObject from 'lance/serialize/DynamicObject';
import BaseTypes from 'lance/serialize/BaseTypes';
import StaticActor from '../client/StaticActor.js';
import { getSiegeItemFromId } from '../config';

export default class DefenseAvatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                objectType: { type: BaseTypes.TYPES.STRING },
                playerNumber: { type: BaseTypes.TYPES.INT32 },
                behaviorType: { type: BaseTypes.TYPES.STRING },
                blockingBehavior: { type: BaseTypes.TYPES.STRING },
                dbId: { type: BaseTypes.TYPES.STRING },
                collected: { type: BaseTypes.TYPES.STRING },
                attachedSiegeItemId: { type: BaseTypes.TYPES.STRING }
            },
            super.netScheme
        );
    }

    static get name() {
        return 'DefenseAvatar';
    }

    syncTo(other) {
        if (
            this.attachedSiegeItemId == null &&
            other.attachedSiegeItemId != null &&
            this.actor
        ) {
            console.log(
                `Syncing new attachedSiegeItemId: ${other.attachedSiegeItemId}`
            );
            this.attachSiegeItemSprite(other.attachedSiegeItemId);
        }
        super.syncTo(other);
        this.attachedSiegeItemId = other.attachedSiegeItemId;
    }

    attachSiegeItemSprite(siegeItemId) {
        this.actor.setLoading(false);

        let siegeItem = getSiegeItemFromId(siegeItemId);
        this.actor.compositeSprite(siegeItem.name);
    }

    get isKeyObject() {
        return true;
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props) {
            this.objectType = props.objectType;
            this.dbId = props.dbId.toString();
            this.collected = props.collected.toString();
            this.behaviorType = props.behaviorType;
            this.playerNumber = props.playerNumber;
            this.width = props.width;
            this.height = props.height;
            this.blockingBehavior = props.blockingBehavior;
        }
        this.attachedSiegeItemId = null;
        this.class = DefenseAvatar;
    }

    setLoading(id) {
        if (id) {
            this.actor.setLoading(true, getSiegeItemFromId(id).name);
        } else {
            this.actor.setLoading(false);
        }
    }

    setPlacable(set) {
        this.actor.setPlacable(set);
    }

    isCountered() {
        return this.attachedSiegeItemId != null;
    }

    get blocks() {
        return this.blockingBehavior == 'blocks' && !this.isCountered();
    }

    get slows() {
        return this.blockingBehavior == 'slows' && !this.isCountered();
    }

    attachCounter(siegeItemId) {
        if (this.attachedSiegeItemId != null) {
            throw new Error(
                `Cannot attach siege item: ${
                    this.attachedSiegeItemId
                } is already attached`
            );
        }
        this.attachedSiegeItemId = siegeItemId;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer && !this.actor) {
            this.actor = new StaticActor(
                this,
                gameEngine.renderer,
                this.objectType
            );
            if (this.attachedSiegeItemId) {
                this.attachSiegeItemSprite(this.attachedSiegeItemId);
            }
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
