import TestClient from './TestClient';
import TestServer from './TestServer';
import { GameStatus as Status } from '../../src/common/types';
import { Response } from '../../src/common/Socket';

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

    describe('on disconnect', () => {
        let client;
        let other;
        let disconnect;

        beforeEach(() => {
            client = clients[0];
            other = clients[1];

            disconnect = eventPromise(
                other.socket,
                'gameState',
                (data) => data.state == Status.SUSPENDED
            );
            client.socket.close();
        });

        it('correctly broadcasts suspend', async () => {
            await disconnect;
        });

        it('correctly prevents all socket interactions', async () => {
            await disconnect;

            // map over api events. try them. done should work.
            let resp = await other.socket.request('makeAssaultBot');

            expect(resp.type).toEqual(Response.ERROR);
            expect(resp.msg).toEqual('Application state is suspended');
        });
    });

    describe('on reconnect', () => {
        describe('when one player disconnects and reconnects', async () => {
            let disconnectAndReconnect = async (client, other) => {
                // create game. client closes socket.
                let disconnect = eventPromise(
                    other.socket,
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
                await disconnectAndReconnect(clients[0], clients[1]);
            });

            it('playerIds are the same', async () => {
                let ids = server.playerIds;

                await disconnectAndReconnect(clients[0], clients[1]);

                expect(server.playerIds).toEqual(ids);
            });

            /* // Doesn't work in test environment
            it('can move again', async () => {
                const client = clients[0];

                const promise = eventPromise(server.gameEngine, 'move');
                client.client.clientEngine.sendInput('up');

                await promise;

                await disconnectAndReconnect(client, clients[1]);
            });*/

            it('previous state restored', async () => {
                const client = clients[0];

                const resp = await client.socket.request('makeAssaultBot');

                console.log(resp);

                expect(resp.type).toEqual(Response.SUCCESS);

                await disconnectAndReconnect(client, clients[1]);

                let resourceBroadcast = eventPromise(
                    client.socket,
                    'resourceInitial',
                    (data) => data['wood'] == 0
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

import models from '../../src/server/db/models';

describe('practice Instance', () => {
    let server;
    let socket;

    beforeEach(async () => {
        var obj = await TestServer.createPracticeServer();

        server = obj.server;
        socket = obj.socket;
    });

    function disconnect() {
        let dc = eventPromise(server.events, 'instanceStopped');

        socket.close();

        return dc;
    }

    it('shuts down when player disconnects', async () => {
        await disconnect();

        expect(Object.keys(server.instanceManager.instances).length).toEqual(0);
    });

    it('does not delete bot user when player disconnects', async () => {
        await disconnect();

        let botUser = await models.user.findOne({
            where: { username: '_botuser' }
        });

        expect(botUser).toBeDefined();
    });
});
