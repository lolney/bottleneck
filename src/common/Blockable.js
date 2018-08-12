import DynamicObject from 'lance/serialize/DynamicObject';
import Serializer from 'lance/serialize/Serializer';
import StaticActor from '../client/StaticActor';

export default class Blockable extends DynamicObject {
    static get netScheme() {
        return Object.assign({}, super.netScheme);
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        this.class = Blockable;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor = new StaticActor(this, gameEngine.renderer, 'google');
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
