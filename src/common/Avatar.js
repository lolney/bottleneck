'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import Serializer from 'lance/serialize/Serializer';
import GameObjectActor from '../client/GameObjectActor.js';

export default class Avatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                objectType: { type: Serializer.TYPES.STRING },
                dbId: { type: Serializer.TYPES.STRING },
                solvedBy: { type: Serializer.TYPES.STRING },
                problemId: { type: Serializer.TYPES.STRING }
            },
            super.netScheme
        );
    }

    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props) {
            this.objectType = props.objectType;
            this.dbId = props.dbId;
            this.solvedBy = props.solvedBy;
            this.problemId = props.problemId;
        }
        this.class = Avatar;
        // TODO: add this to a config
        this.width = 100;
        this.height = 25;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor = new GameObjectActor(
                this,
                gameEngine.renderer,
                this.objectType,
                this.problemId,
                gameEngine.playerId,
                this.solvedBy
            );
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
