import DynamicObject from 'lance/serialize/DynamicObject';
import TilingActor from '../client/TilingActor';
import BaseTypes from 'lance/serialize/BaseTypes';
import { horizontalWall, verticalWall } from '../config';

export default class WallAvatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                width: { type: BaseTypes.TYPES.FLOAT32 },
                height: { type: BaseTypes.TYPES.FLOAT32 }
            },
            super.netScheme
        );
    }

    static get name() {
        return 'WallAvatar';
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props) {
            this.width = props.width;
            this.height = props.height;
        }
        this.class = WallAvatar;
    }

    get blocks() {
        return true;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            let resource =
                this.width > this.height
                    ? horizontalWall.name
                    : verticalWall.name;
            this.actor = new TilingActor(this, gameEngine.renderer, resource);
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
