import DynamicObject from 'lance/serialize/DynamicObject';
import Serializer from 'lance/serialize/Serializer';

export default class DummyPlayer extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                playerNumber: { type: Serializer.TYPES.INT32 }
            },
            super.netScheme
        );
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props) {
            this.playerNumber = props.playerNumber;
        }
        this.class = DummyPlayer;
        this.width = 25;
        this.height = 25;
    }
}
