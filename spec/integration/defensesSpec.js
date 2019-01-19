import TestServer from './TestServer';
import TwoVector from 'lance/serialize/TwoVector';

describe('siegeItems', () => {
    let client;
    let server;

    beforeAll(async () => {
        var obj = await TestServer.createPracticeServer();

        client = obj.client;
        server = obj.server;
    });

    it('correct defenses placed correctly', async () => {
        const pos = new TwoVector(0, 0);

        const { data } = await client.router.makeDefense('4', pos);

        expect(data.dbId).toEqual('4');
        expect(data.position.x).toEqual(pos.x);
        expect(data.position.y).toEqual(pos.y);
    });

    it('incorrect defenses return error', async () => {
        const pos = new TwoVector(0, 0);

        const resp = await client.router.makeDefense('1', pos);

        expect(resp.type).toEqual('ERROR');
    });

    it('correct offenses placed correctly', (done) => {
        const pos = new TwoVector(0, 0);

        client.router.makeDefense('4', pos);
        server.gameEngine.once('objectAdded', (object) => {
            expect(object.isCountered()).toBe(false);
            client.router.mergeObjects('1', object.id);

            const waitToBeAdded = () => {
                if (!object.isCountered()) {
                    setTimeout(waitToBeAdded, 50);
                } else {
                    done();
                }
            };
            waitToBeAdded();
        });
    });

    it('incorrect offenses return error', async () => {
        const pos = new TwoVector(0, 0);

        const object = await client.router.makeDefense('4', pos);
        const resp = await client.router.mergeObjects('4', object.data.id);

        expect(resp.type).toEqual('ERROR');
    });

    it('offenses with incorrect gameObjectId return error', async () => {
        const resp = await client.router.mergeObjects('1', 'invalidId');

        expect(resp.type).toEqual('ERROR');
    });
});
