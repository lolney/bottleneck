import TestServer from './TestServer';
import TwoVector from 'lance/serialize/TwoVector';
import PlayerAvatar, {
    NEARNESS_THRESHOLD
} from '../../src/common/PlayerAvatar';

describe('BotAvatar', () => {
    let server;
    let client;

    beforeAll(async () => {
        var obj = await TestServer.createPracticeServer();

        server = obj.server;
        client = obj.client;
    });

    /* // Doesn't work without network events working (which don't in Node)
    it('can move by sending coordinate events', async (done) => {
        const player = client.events;

        const coords = player.position.clone().add(new TwoVector(15, 15));
        client.clientEngine.sendInput(coords);
    });*/

    it('can move by calling moveTo', async (done) => {
        const player = server.gameEngine.queryObject(
            { playerNumber: client.gameEngine.playerId },
            PlayerAvatar
        );

        const coords = player.position.clone().add(new TwoVector(15, 15));
        player.moveTo(server.gameEngine, coords);

        setTimeout(() => {
            expect(player.position.x).toBeGreaterThan(
                coords.x - NEARNESS_THRESHOLD
            );

            expect(player.position.x).toBeLessThan(
                coords.x + NEARNESS_THRESHOLD
            );

            expect(player.position.y).toBeGreaterThan(
                coords.y - NEARNESS_THRESHOLD
            );

            expect(player.position.y).toBeLessThan(
                coords.y + NEARNESS_THRESHOLD
            );

            done();
        }, 1000);
    });
});
