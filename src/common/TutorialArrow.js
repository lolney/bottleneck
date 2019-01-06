'use strict';

import DynamicObject from 'lance/serialize/DynamicObject';
import StaticActor from '../client/StaticActor.js';
import { tutorialArrow } from '../config';

export default class TutorialArrow extends DynamicObject {
    constructor(gameEngine, options, props) {
        super(gameEngine, options, props);
        if (props) {
            this.direction = props.direction;
        }
        this.class = TutorialArrow;
    }

    onAddToWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor = new StaticActor(
                this,
                gameEngine.renderer,
                tutorialArrow.name
            );
            this.actor.setAnchor(0, 0.5);
            this.actor.scale(0.5);
        }
    }

    onRemoveFromWorld(gameEngine) {
        if (gameEngine.renderer) {
            this.actor.destroy(this.id, gameEngine.renderer);
        }
    }
}
