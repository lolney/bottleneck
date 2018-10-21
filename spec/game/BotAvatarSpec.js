import BotAvatar from '../../src/common/BotAvatar';
import AssaultBotAvatar, {
    State as AssaultState
} from '../../src/common/AssaultBotAvatar';
import CollectionBotAvatar, {
    State as CollectionState
} from '../../src/common/CollectionBotAvatar';
import GameWorld from '../../src/server/GameWorld';
import TwoVector from 'lance/serialize/TwoVector';
import { WIDTH, HEIGHT } from '../../src/config';

let resourcePositions = [
    new TwoVector((3 * WIDTH) / 8, 0),
    new TwoVector((5 * WIDTH) / 8, 0),
    new TwoVector((7 * WIDTH) / 8, 0)
];
const gameEngine = {
    getResources: () => {
        return resourcePositions.map((pos, i) => ({
            position: pos,
            dbId: i.toString()
        }));
    },
    on: () => {}
};

describe('BotAvatar', () => {
    let avatar;

    beforeEach(() => {
        avatar = new BotAvatar(this, null, {
            position: new TwoVector(WIDTH / 2, HEIGHT / 2),
            playerNumber: 0
        });
        let gameWorld = GameWorld.generate();
        resourcePositions = avatar.attach(null, gameWorld, gameEngine);
    });

    it('initializes correctly', () => {
        let avatar = new BotAvatar(this, null, {});

        expect(avatar).not.toBe(undefined);
    });

    it('properly follows a path', async () => {
        await avatar.followWaypoint();

        expect(Math.abs(avatar.velocity.x + avatar.velocity.y)).toBeGreaterThan(
            0
        );
    });
});

describe('CollectionBotAvatar', () => {
    let avatar;

    beforeEach(() => {
        avatar = new CollectionBotAvatar(this, null, {
            position: new TwoVector(WIDTH / 2, HEIGHT / 2),
            playerNumber: 0
        });
        let gameWorld = GameWorld.generate();

        avatar.attach(null, gameWorld, gameEngine);
    });

    it('resources initialized correctly', () => {
        let sorted = resourcePositions.sort((a, b) => a.x > b.x);
        for (let i = 0; i < 3; i++) {
            expect(avatar.nextResource().position.x).toEqual(sorted[i].x);
        }

        expect(avatar.nextResource()).toBe(undefined);
    });

    it('properly creates a path', async () => {
        let path = await avatar.newPath();

        expect(path).not.toBe(undefined);
        expect(path.length).toBeGreaterThan(0);
    });

    it('can reset properly while following a resource', async () => {
        expect(avatar.targetGameObject).toBe(null);
        await avatar.followWaypoint();

        expect(avatar.state).toEqual(CollectionState.LEAVING);
        expect(avatar.targetGameObject.dbId).toEqual('0');

        await avatar.resetPath();

        expect(avatar.targetGameObject.dbId).toEqual('0');
        expect(avatar.state).toEqual(CollectionState.LEAVING);
        expect(avatar.path).not.toBe(null);
    });
});

describe('AssaultBotAvatar', () => {
    let avatar;
    let assaulted;

    beforeEach(() => {
        avatar = new AssaultBotAvatar(this, null, {
            position: new TwoVector(WIDTH / 2, HEIGHT / 2),
            playerNumber: 0
        });
        assaulted = false;
        let gameWorld = GameWorld.generate();
        let controller = {
            doAssault: () => {
                assaulted = true;
            }
        };

        avatar.attach(controller, gameWorld, gameEngine);
    });

    it(' properly creates a path', async () => {
        let path = await avatar.newPath();

        expect(path).not.toBe(undefined);
        expect(avatar.state).toEqual(AssaultState.ASSAULTING);
        expect(path.length).toBeGreaterThan(0);
    });

    it('can reset properly while assaulting', async () => {
        await avatar.followWaypoint();

        expect(avatar.state).toEqual(AssaultState.ASSAULTING);

        await avatar.resetPath();

        expect(avatar.state).toEqual(AssaultState.ASSAULTING);
        expect(avatar.path).not.toBe(null);
    });

    it('properly removes from world', async () => {
        let destination = avatar.serverState.gameWorld.getStartingPosition(1);
        let toString = (vec) => `${vec.x},${vec.y}`;

        avatar.path = [toString(destination)];
        avatar.position = destination;
        avatar.state = AssaultState.ASSAULTING;

        let removed = false;
        gameEngine.removeObjectFromWorld = () => (removed = true);

        expect(assaulted).toEqual(false);

        await avatar.followWaypoint();

        expect(assaulted).toEqual(true);
        expect(avatar.state).toEqual(AssaultState.AT_ENEMY_BASE);
        expect(removed).toEqual(true);
    });
});
