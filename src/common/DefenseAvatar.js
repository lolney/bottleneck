import DynamicObject from 'lance/serialize/DynamicObject';
import Serializer from 'lance/serialize/Serializer';
import StaticActor from '../client/StaticActor.js';
import { Player, getSiegeItemFromId } from '../config';

export default class DefenseAvatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                objectType: { type: Serializer.TYPES.STRING },
                playerNumber: { type: Serializer.TYPES.INT32 },
                behaviorType: { type: Serializer.TYPES.STRING },
                dbId: { type: Serializer.TYPES.STRING },
                collected: { type: Serializer.TYPES.STRING },
                attachedSiegeItemId: { type: Serializer.TYPES.STRING }
            },
            super.netScheme
        );
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
        return !this.isCountered();
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
