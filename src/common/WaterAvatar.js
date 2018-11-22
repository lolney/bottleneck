import DynamicObject from 'lance/serialize/DynamicObject';
import ShaderActor from '../client/ShaderActor';
import BaseTypes from 'lance/serialize/BaseTypes';
import { water as waterShader } from '../shaders';

export default class WaterAvatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                width: { type: BaseTypes.TYPES.FLOAT32 },
                height: { type: BaseTypes.TYPES.FLOAT32 }
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
        this.class = WaterAvatar;
    }

    get blocks() {
        return false;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor = new ShaderActor(
                this,
                gameEngine.renderer,
                waterShader
            );
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
