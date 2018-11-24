import TestClient from './TestClient';
import TestServer from './TestServer';

describe('BotAvatar', () => {
    let client;
    let server;
    let socket;

    beforeAll(async () => {
        server = new TestServer();
        client = new TestClient(server.serverURL);
        socket = await client.start();
        await new Promise((resolve) =>
            server.gameEngine.on('playerAdded', () => resolve())
        );
    });

    it('initializes correctly', (done) => {
        socket.once('resourceInitial', () => {
            done();
        });
        socket.emit('resourceInitial');
    });
});
