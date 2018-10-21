import DynamicObject from 'lance/serialize/DynamicObject';
import ShaderActor from '../client/ShaderActor';
import Serializer from 'lance/serialize/Serializer';
import { water as waterShader } from '../shaders';

export default class WaterAvatar extends DynamicObject {
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
        this.class = WaterAvatar;
    }

    blocks() {
        return true;
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