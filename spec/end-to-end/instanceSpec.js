import TestClient from './TestClient';
import TestServer from './TestServer';
import { GameStatus as Status } from '../../src/common/types';

describe('Instance', () => {
    let clients;
    let server;

    beforeEach(async () => {
        server = await TestServer.create();
        clients = await Promise.all(
            [0, 1].map(async () => {
                const client = new TestClient(server.serverURL);
                const socket = await client.start();
                return {
                    client,
                    socket
                };
            })
        );
        await new Promise((resolve) =>
            server.gameEngine.on('playerAdded', () => resolve())
        );
    });

    it('is created correctly', () => {
        expect(server.gameEngine.status).toEqual(Status.IN_PROGRESS);
    });

    it('correctly broadcasts suspend when a player disconnects', (done) => {
        clients[0].socket.once('gameState', (data) => {
            expect(data.state).toEqual(Status.SUSPENDED);
            done();
        });

        clients[1].socket.close();
    });
});
