import AnimatedActor from './AnimatedActor';
import { waves } from '../shaders';
import { resourceObjectTypes } from '../constants';
let PIXI = null;

/**
 * Has sprites for
 * - Unsolved
 * - Solved by another player
 * - Solved by player that owns this game engine
 */
class GameObjectActor {
    constructor(
        avatar,
        renderer,
        resource,
        problemId,
        myplayerNumber,
        solvedBy,
        collected
    ) {
        PIXI = require('pixi.js');

        this.actor = new AnimatedActor(avatar, renderer, resource, 0.1, true);

        this.myplayerNumber = myplayerNumber;
        this.handleSolutionFromPlayer(solvedBy, collected);

        // Add to renderer index
        renderer.addGameObjectActor(problemId, this);
    }

    handleSolutionFromPlayer(playerNumber, collected) {
        // Collected
        if (collected == true) {
            this.actor.playOnce(-1);
            let filter = new PIXI.filters.AlphaFilter(0.4);
            this.actor.sprite.filters = [filter];
        }
        // Solved by active player
        else if (playerNumber == this.myplayerNumber) {
            let filter = new PIXI.filters.ColorMatrixFilter();
            filter.negative();
            this.actor.sprite.filters = [filter];
        }
        // Solved by another player
        else if (playerNumber != undefined) {
            let filter = new PIXI.filters.ColorMatrixFilter();
            filter.greyscale();
            this.actor.sprite.filters = [filter];
        }
    }

    destroy(id, renderer) {
        this.actor.destroy(id, renderer);
    }

    getSprite() {
        return this.actor.sprite;
    }
}

class RockActor extends GameObjectActor {
    constructor(
        avatar,
        renderer,
        resource,
        problemId,
        myplayerNumber,
        solvedBy,
        collected
    ) {
        super(
            avatar,
            renderer,
            resource,
            problemId,
            myplayerNumber,
            solvedBy,
            collected
        );
        this.actor.setShader(avatar, renderer, waves);
    }
}

class MineActor extends GameObjectActor {
    handleSolutionFromPlayer(playerNumber, collected) {
        // Collected
        if (collected == true) {
            let filter = new PIXI.filters.AlphaFilter(0.4);
            this.actor.sprite.filters = [filter];
        }
        // Solved by active player
        else if (playerNumber == this.myplayerNumber) {
            this.actor.playOnce(-1);
            super.handleSolutionFromPlayer(playerNumber, collected);
        }
        // Solved by another player
        else if (playerNumber != undefined) {
            this.actor.playOnce(-1);
            super.handleSolutionFromPlayer(playerNumber, collected);
        }
    }
}

export class GameObjectActorFactory {
    static create(
        avatar,
        renderer,
        resource,
        problemId,
        myplayerNumber,
        solvedBy,
        collected
    ) {
        const Actor = (() => {
            switch (avatar.objectType) {
            case resourceObjectTypes.MINE:
                return MineActor;
            case resourceObjectTypes.ROCK:
                return RockActor;
            default:
                return GameObjectActor;
            }
        })();

        return new Actor(
            avatar,
            renderer,
            resource,
            problemId,
            myplayerNumber,
            solvedBy,
            collected
        );
    }
}
