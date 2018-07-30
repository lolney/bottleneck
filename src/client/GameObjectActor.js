import StaticActor from './StaticActor';

/**
 * Has sprites for
 * - Unsolved
 * - Solved by another player
 * - Solved by player that owns this game engine
 */
export default class GameObjectActor {
    constructor(avatar, renderer, resource, problemId, myPlayerId, solvedBy) {
        this.actor = new StaticActor(avatar, renderer, resource);
        this.myPlayerId = myPlayerId;
        this.handleSolutionFromPlayer(solvedBy);
        renderer.addGameObjectActor(problemId, this);
    }

    handleSolutionFromPlayer(playerId) {
        if (playerId == null) {
            this.actor.sprite.filters = [];
        } else if (playerId == this.myPlayerId) {
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
