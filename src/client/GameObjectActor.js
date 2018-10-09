import AnimatedActor from './AnimatedActor';

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
        this.actor = new AnimatedActor(avatar, renderer, resource, 0.1, true);
        this.myplayerNumber = myplayerNumber;
        this.handleSolutionFromPlayer(solvedBy, collected);
        renderer.addGameObjectActor(problemId, this);
    }

    handleSolutionFromPlayer(playerNumber, collected) {
        if (collected == true) {
            this.actor.playOnce();
            let filter = new PIXI.filters.AlphaFilter(0.4);
            this.actor.sprite.filters = [filter];
        } else if (playerNumber == undefined || playerNumber == null) {
            this.actor.sprite.filters = [];
        } else if (playerNumber == this.myplayerNumber) {
            let filter = new PIXI.filters.ColorMatrixFilter();
            filter.negative();
            this.actor.sprite.filters = [filter];
        } else {
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
