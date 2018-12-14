import TestClient from './TestClient';
import TestServer from './TestServer';
import { GameStatus as Status } from '../../src/common/types';

function on(socket, event, handler = () => true) {
    return new Promise((resolve) => {
        socket.on(event, (data) => {
            if (handler(data)) {
                resolve();
            }
        });
    });
}

describe('Instance', () => {
    let clients;
    let server;

    beforeEach(async () => {
        server = await TestServer.create();
        let playersAdded = [0, 1].map(() =>
            on(server.gameEngine, 'playerAdded')
        );

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
        await Promise.all(playersAdded);
    });

    it('is created correctly', () => {
        expect(server.gameEngine.status).toEqual(Status.IN_PROGRESS);
    });

    it('correctly broadcasts suspend when a player disconnects', (done) => {
        clients[0].socket.on('gameState', (data) => {
            if (data.state == Status.SUSPENDED) {
                done();
            }
        });

        clients[1].socket.close();
    });

    describe('reconnect', () => {
        it('attempted if one player disconnects and reconnects', async () => {
            let stateChanges = clients.map((client) =>
                on(
                    client.socket,
                    'gameState',
                    (data) => data.state == Status.IN_PROGRESS
                )
            );

            // create game. client closes socket.
            let disconnect = on(clients[0].socket, 'disconnect');
            clients[0].socket.close();

            await disconnect;
            // client reopens socket. reconnect to same game
            // game state resumed for both players
            clients[0].socket.connect();

            await Promise.all(stateChanges);
        });

        it('result in error when both players have disconnected', async () => {
            const disconnects = clients.map((client) =>
                on(client.socket, 'disconnect')
            );

            const connects = clients.map((client) =>
                on(client.socket, 'connect')
            );

            // create game. both clients close socket.
            clients.map((client) => client.socket.close());

            await Promise.all(disconnects);

            // both clients reconnect. not put in a game.
            clients.map((client) => client.socket.connect());

            await Promise.all(connects);

            expect(
                Object.keys(server.instanceManager.instances).length
            ).toEqual(0);
        });
    });
});
