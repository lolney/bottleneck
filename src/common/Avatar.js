'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import BaseTypes from 'lance/serialize/BaseTypes';
import { GameObjectActorFactory } from '../client/GameObjectActor.js';
import { Player } from '../config';

export default class Avatar extends DynamicObject {
    static get netScheme() {
        return Object.assign(
            {
                objectType: { type: BaseTypes.TYPES.STRING },
                behaviorType: { type: BaseTypes.TYPES.STRING },
                dbId: { type: BaseTypes.TYPES.STRING },
                solvedBy: { type: BaseTypes.TYPES.STRING },
                collected: { type: BaseTypes.TYPES.STRING },
                problemId: { type: BaseTypes.TYPES.STRING }
            },
            super.netScheme
        );
    }

    static get name() {
        return 'Avatar';
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

    get blocks() {
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
            this.actor = GameObjectActorFactory.create(
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
