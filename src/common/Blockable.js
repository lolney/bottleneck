import DynamicObject from 'lance/serialize/DynamicObject';
import TilingActor from '../client/TilingActor';
import Serializer from 'lance/serialize/Serializer';

export default class Blockable extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                width: { type: Serializer.TYPES.FLOAT32 },
                height: { type: Serializer.TYPES.FLOAT32 }
            },
            super.netScheme
        );
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props) {
            this.width = props.width;
            this.height = props.height;
        }
        this.class = Blockable;
    }

    blocks() {
        return true;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor = new TilingActor(this, gameEngine.renderer, 'wall');
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
