'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import Serializer from 'lance/serialize/Serializer';
import GameObjectActor from '../client/GameObjectActor.js';
import { Player } from '../config';

export default class Avatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                objectType: { type: Serializer.TYPES.STRING },
                behaviorType: { type: Serializer.TYPES.STRING },
                dbId: { type: Serializer.TYPES.STRING },
                solvedBy: { type: Serializer.TYPES.STRING },
                collected: { type: Serializer.TYPES.STRING },
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
            this.collected = props.collected.toString();
            this.problemId = props.problemId;
            this.behaviorType = props.behaviorType;
        }
        this.class = Avatar;
        this.width = Player.width;
        this.height = Player.height;
    }

    blocks() {
        return this.behaviorType == 'defense';
    }

    syncTo(other) {
        super.syncTo(other);
        if (this.collected != other.collected) {
            console.log('setting resource to collected');
            let target = other.actor ? other : this;
            target.actor.handleSolutionFromPlayer(other.solvedBy, true);
        }
        this.collected = other.collected;
        this.solvedBy = other.solvedBy;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor = new GameObjectActor(
                this,
                gameEngine.renderer,
                this.objectType,
                this.problemId,
                gameEngine.playerId,
                this.solvedBy,
                this.collected === 'true'
            );
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
