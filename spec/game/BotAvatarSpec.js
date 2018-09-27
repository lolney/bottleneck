import BotAvatar from '../../src/common/BotAvatar';
import GameWorld from '../../src/server/GameWorld';
import TwoVector from 'lance/serialize/TwoVector';
import { WIDTH, HEIGHT } from '../../src/server/GameWorld';

describe('BotAvatar', () => {
    let avatar = new BotAvatar(this, null, {
        position: new TwoVector(WIDTH / 2, HEIGHT / 2)
    });
    let gameWorld = GameWorld.generate();
    let resourcePosition = new TwoVector(WIDTH / 2, 0);

    let gameEngine = {
        closestResource: () => {
            return { position: resourcePosition };
        }
    };

    it('initializes correctly', () => {
        let avatar = new BotAvatar(this, null, {});

        expect(avatar).not.toBe(undefined);
    });

    it('properly creates a path', () => {
        let path = avatar.newPath(gameWorld, gameEngine);

        expect(path).not.toBe(undefined);
        expect(path.length).toBeGreaterThan(0);
    });

    it('properly follows a path', () => {
        avatar.followWaypoint(gameWorld, gameEngine);

        expect(Math.abs(avatar.velocity.x + avatar.velocity.y)).toBeGreaterThan(
            0
        );
    });
});
