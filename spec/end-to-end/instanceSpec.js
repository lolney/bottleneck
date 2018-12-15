import TestClient from './TestClient';
import TestServer from './TestServer';
import { GameStatus as Status } from '../../src/common/types';

function eventPromise(socket, event, handler = () => true) {
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
            eventPromise(server.gameEngine, 'playerAdded')
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

    describe('on reconnect', () => {
        describe('when one player disconnects and reconnects', async () => {
            let disconnectAndReconnect = async (client) => {
                // create game. client closes socket.
                let disconnect = eventPromise(
                    clients[1].socket,
                    'gameState',
                    (data) => data.state == Status.SUSPENDED
                );
                client.socket.close();

                await disconnect;

                let connections = clients.map((client, i) =>
                    eventPromise(
                        client.socket,
                        'gameState',
                        (data) => data.state == Status.IN_PROGRESS
                    )
                );

                // client reopens socket. reconnect to same game
                // game state resumed for both players
                client.socket.connect();

                await Promise.all(connections);
            };

            it('game resumes', async () => {
                await disconnectAndReconnect(clients[0]);
            });

            it('playerIds are the same', async () => {
                let ids = server.playerIds;

                await disconnectAndReconnect(clients[0]);

                expect(server.playerIds).toEqual(ids);
            });

            it('previous state restored', async () => {
                const client = clients[0];

                let makeAssaultBot = eventPromise(
                    client.socket,
                    'makeAssaultBot',
                    (resp) => resp.type == 'SUCCESS'
                );

                client.socket.emit('makeAssaultBot');
                await makeAssaultBot;

                await disconnectAndReconnect(clients[0]);

                let resourceBroadcast = eventPromise(
                    client.socket,
                    'resourceInitial',
                    (data) => {
                        console.log('initial');
                        return data['wood'] == 0;
                    }
                );
                client.socket.emit('resourceInitial');
                await resourceBroadcast;
            });
        });

        it('results in error when both players have disconnected', async () => {
            const disconnects = eventPromise(server.events, 'instanceStopped');

            const connects = clients.map((client) =>
                eventPromise(client.socket, 'connect')
            );

            // create game. both clients close socket.
            clients.map((client) => client.socket.close());

            await disconnects;

            // both clients reconnect. not put in a game.
            clients.map((client) => client.socket.connect());

            await Promise.all(connects);

            expect(
                Object.keys(server.instanceManager.instances).length
            ).toEqual(0);
        });
    });
});

describe('practice Instance', () => {
    let server;
    let socket;

    beforeAll(async () => {
        var obj = await TestServer.createPracticeServer();

        server = obj.server;
        socket = obj.socket;
    });

    it('shuts down when player disconnects', async () => {
        let disconnect = eventPromise(server.events, 'instanceStopped');

        socket.close();

        await disconnect;

        expect(Object.keys(server.instanceManager.instances).length).toEqual(0);
    });
});
