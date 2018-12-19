import serverIO from 'socket.io';
import clientSocketIO from 'socket.io-client';
import Socket, { Response } from '../../src/common/Socket';

let port = 7000;

describe('Socket', () => {
    let clientSocket;
    let serverSocket;
    let data;

    const setup = async () => {
        const uri = `localhost:${++port}`;
        const server = serverIO(port);
        data = { test: 'test' };

        let socket = clientSocketIO(uri);

        await new Promise((resolve) =>
            server.on('connect', (socket) => {
                serverSocket = new Socket(socket, false);
                resolve();
            })
        );
        await new Promise((resolve) => socket.on('connect', () => resolve()));

        clientSocket = new Socket(socket, false);
    };

    describe('when not suspended', () => {
        beforeAll(async () => await setup());

        it('server can send success responses', (done) => {
            clientSocket.emit('expect success', {}, (resp) => {
                expect(resp.type).toEqual(Response.SUCCESS);
                expect(resp.data).toEqual('hello');
                done();
            });
            serverSocket.transaction('expect success', () =>
                Response.ok('hello')
            );
        });

        it('server can send error responses', (done) => {
            clientSocket.emit('expect error', {}, (resp) => {
                expect(resp.type).toEqual(Response.ERROR);
                expect(resp.msg).toEqual('hello');
                done();
            });
            serverSocket.transaction('expect error', () =>
                Response.err('hello')
            );
        });

        it('can use requests', async () => {
            serverSocket.transaction('resp', () => Response.ok('hello'));
            const response = await clientSocket.request('resp', {});

            expect(response.type).toEqual(Response.SUCCESS);
            expect(response.data).toEqual('hello');
        });

        it('clientSocket can receive `once` events', async () => {
            let promise = clientSocket.once('event');

            serverSocket.emit('event', data);
            let resp = await promise;

            expect(resp).toEqual(data);
        });
    });

    describe('when suspended', () => {
        beforeAll(async () => await setup());

        it('should return err', async () => {
            serverSocket.transaction('resp', () => Response.ok('hello'));
            serverSocket.suspended = true;

            const response = await clientSocket.request('resp', {});

            expect(response.type).toEqual(Response.ERROR);
            expect(response.msg).toEqual('Application state is suspended');
        });
    });
});
