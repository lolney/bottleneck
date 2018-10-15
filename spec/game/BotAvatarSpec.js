import BotAvatar, { State } from '../../src/common/BotAvatar';
import GameWorld from '../../src/server/GameWorld';
import TwoVector from 'lance/serialize/TwoVector';
import { WIDTH, HEIGHT } from '../../src/config';

describe('BotAvatar', () => {
    let avatar;
    let resourcePositions;

    beforeEach(() => {
        avatar = new BotAvatar(this, null, {
            position: new TwoVector(WIDTH / 2, HEIGHT / 2),
            playerNumber: 0
        });
        let gameWorld = GameWorld.generate();
        resourcePositions = [
            new TwoVector((3 * WIDTH) / 8, 0),
            new TwoVector((5 * WIDTH) / 8, 0),
            new TwoVector((7 * WIDTH) / 8, 0)
        ];

        let gameEngine = {
            getResources: () => {
                return resourcePositions.map((pos, i) => ({
                    position: pos,
                    dbId: i.toString()
                }));
            },
            on: () => {}
        };

        avatar.attach(null, gameWorld, gameEngine);
    });

    it('resources initialized correctly', () => {
        let sorted = resourcePositions.sort((a, b) => a.x > b.x);
        for (let i = 0; i < 3; i++) {
            expect(avatar.nextResource().position.x).toEqual(sorted[i].x);
        }

        expect(avatar.nextResource()).toBe(undefined);
    });

    it('initializes correctly', () => {
        let avatar = new BotAvatar(this, null, {});

        expect(avatar).not.toBe(undefined);
    });

    it('properly creates a path', async () => {
        let path = await avatar.newPath();

        expect(path).not.toBe(undefined);
        expect(path.length).toBeGreaterThan(0);
    });

    it('properly follows a path', async () => {
        await avatar.followWaypoint();

        expect(Math.abs(avatar.velocity.x + avatar.velocity.y)).toBeGreaterThan(
            0
        );
    });

    it('can reset properly while following a resource', async () => {
        expect(avatar.targetGameObject).toBe(null);
        await avatar.followWaypoint();

        expect(avatar.state).toEqual(State.LEAVING);
        expect(avatar.targetGameObject.dbId).toEqual('0');

        await avatar.resetPath();

        expect(avatar.targetGameObject.dbId).toEqual('0');
        expect(avatar.state).toEqual(State.LEAVING);
        expect(avatar.path).not.toBe(null);
    });
});
