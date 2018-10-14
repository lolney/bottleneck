import DynamicObject from 'lance/serialize/DynamicObject';
import Serializer from 'lance/serialize/Serializer';
import StaticActor from '../client/StaticActor.js';
import { Player } from '../config';

export default class DefenceAvatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                objectType: { type: Serializer.TYPES.STRING },
                behaviorType: { type: Serializer.TYPES.STRING },
                dbId: { type: Serializer.TYPES.STRING },
                collected: { type: Serializer.TYPES.STRING }
            },
            super.netScheme
        );
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props) {
            this.objectType = props.objectType;
            this.dbId = props.dbId;
            this.collected = props.collected.toString();
            this.behaviorType = props.behaviorType;
        }
        this.class = DefenceAvatar;
        this.width = Player.width;
        this.height = Player.height;
    }

    blocks() {
        return true;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor = new StaticActor(
                this,
                gameEngine.renderer,
                this.objectType
            );
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
