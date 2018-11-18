const SLOW_FACTOR = 0.1;

export default class Slowable {
    constructor(gameEngine, avatar) {
        let speed = avatar.speed;
        this.collidingObjects = new Set();

        this.startHandler = gameEngine.registerCollisionStart(
            (o) => o == avatar,
            (o) => o.slows,
            (_, o) => {
                this.collidingObjects.add(o);
                avatar.speed = speed * SLOW_FACTOR;
            }
        );

        this.endHandler = gameEngine.registerCollisionStop(
            (o) => o == avatar,
            (o) => this.collidingObjects.has(o),
            (_, o) => {
                this.collidingObjects.delete(o);
                if (this.collidingObjects.size == 0) {
                    avatar.speed = speed;
                }
            }
        );
    }

    onRemove(gameEngine) {
        gameEngine.removeCollisionStop(this.endHandler);
        gameEngine.removeCollisionStart(this.startHandler);
    }
}
