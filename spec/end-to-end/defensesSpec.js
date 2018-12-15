import TestClient from './TestClient';
import TestServer from './TestServer';
import TwoVector from 'lance/serialize/TwoVector';

describe('siegeItems', () => {
    let client;
    let server;
    let socket;

    beforeAll(async () => {
        var obj = await TestServer.createPracticeServer();

        client = obj.client;
        server = obj.server;
        socket = obj.socket;
    });

    it('correct defenses placed correctly', (done) => {
        const pos = new TwoVector(0, 0);

        client.router.makeDefense('4', pos);
        server.gameEngine.once('objectAdded', (object) => {
            expect(object.dbId).toEqual('4');
            expect(object.position).toEqual(pos);
            done();
        });
    });

    it('incorrect defenses return error', (done) => {
        const pos = new TwoVector(0, 0);

        socket.once('makeDefense', (resp) => {
            expect(resp.type).toEqual('ERROR');
            done();
        });
        client.router.makeDefense('1', pos);
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

    it('incorrect offenses return error', (done) => {
        const pos = new TwoVector(0, 0);

        client.router.makeDefense('4', pos);
        server.gameEngine.once('objectAdded', (object) => {
            socket.once('mergeDefenses', (resp) => {
                expect(resp.type).toEqual('ERROR');
                done();
            });
            client.router.mergeObjects('4', object.id);
        });
    });

    it('offenses with incorrect gameObjectId return error', (done) => {
        socket.once('mergeDefenses', (resp) => {
            expect(resp.type).toEqual('ERROR');
            done();
        });
        client.router.mergeObjects('1', 'invalidId');
    });
});
