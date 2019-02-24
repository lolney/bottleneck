import AnimatedActor from './AnimatedActor';
import StaticActor from './StaticActor';
import { waves } from '../shaders';
let PIXI = null;

/*const State = Object.freeze({
    COLLECTED: symbol('collected'),
    SOLVED_BY_ME: symbol('solved_by_me'),
    SOLVED_BY_OTHER: symbol('solved_by_other'),
    UNSOLVED: symbol('unsolved')
});*/

/**
 * Has sprites for
 * - Unsolved
 * - Solved by another player
 * - Solved by player that owns this game engine
 */
export default class GameObjectActor {
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

        // Handle special cases for different object types
        switch (avatar.objectType) {
        case 'tree':
            this.actor.setShader(avatar, renderer, waves);
            break;
        default:
            break;
        }

        this.myplayerNumber = myplayerNumber;
        this.handleSolutionFromPlayer(solvedBy, collected);

        // Add to renderer index
        renderer.addGameObjectActor(problemId, this);
    }

    handleSolutionFromPlayer(playerNumber, collected) {
        // Collected
        if (collected == true) {
            this.actor.playOnce();
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
        else if (playerNumber != undefined && playerNumber != null) {
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
