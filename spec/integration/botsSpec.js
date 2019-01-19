import TestClient from './TestClient';
import TestServer from './TestServer';
import AssaultBotAvatar from '../../src/common/AssaultBotAvatar';

describe('BotAvatar', () => {
    let server;
    let socket;

    beforeAll(async () => {
        var obj = await TestServer.createPracticeServer();

        server = obj.server;
        socket = obj.socket;
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
            socket.request('makeAssaultBot');
        });
    });
});
