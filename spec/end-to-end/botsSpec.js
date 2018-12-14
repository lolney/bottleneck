import TestClient from './TestClient';
import TestServer from './TestServer';
import AssaultBotAvatar from '../../src/common/AssaultBotAvatar';

describe('BotAvatar', () => {
    let client;
    let server;
    let socket;

    beforeAll(async () => {
        server = await TestServer.create({ practice: true });
        let promise = new Promise((resolve) =>
            server.gameEngine.on('playerAdded', () => resolve())
        );
        client = new TestClient(server.serverURL);
        socket = await client.start();
        await promise;
    });

    it('initializes correctly', (done) => {
        socket.once('resourceInitial', () => {
            done();
        });
        socket.emit('resourceInitial');
    });

    it('can add an assault bot', async () => {
        await new Promise((resolve) => {
            server.gameEngine.on('objectAdded', (obj) => {
                if (obj.class == AssaultBotAvatar) {
                    resolve();
                }
            });
            socket.emit('makeAssaultBot');
        });
    });
});
