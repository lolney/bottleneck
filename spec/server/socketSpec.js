import serverIO from 'socket.io';
import clientSocketIO from 'socket.io-client';
import Socket, { Response } from '../../src/common/Socket';
import EventMiddleware from '../../src/react-app/tutorial/eventMiddleware';

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

    it('should unregister handlers properly', async () => {
        await setup();
        const eventName = 'testEvent';
        const handler = clientSocket.on(eventName, () => {
            fail('should be unregistered');
        });

        clientSocket.off(eventName, handler);
        serverSocket.emit(eventName, {});
    });

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

    describe('middleware', () => {
        beforeAll(async () => {
            await setup();
            clientSocket.use({ handle: () => false, forward: () => {} });
        });

        it('should abort request', async (done) => {
            serverSocket.transaction('testEvent', () => {
                fail('should not reach server');
            });
            try {
                await clientSocket.request('testEvent', {});
            } catch (e) {
                expect(e).toEqual(
                    'Middleware prevented request from being sent'
                );
                done();
            }
        });

        it('should abort emit', async () => {
            const result = await clientSocket.emit('testEvent', {});

            expect(result).toBe(false);
        });

        it('emit should not reach server', (done) => {
            serverSocket.once('testEvent', () => {
                fail('should not reach server');
            });
            clientSocket.emit('testEvent', {});

            setTimeout(done, 100);
        });
    });

    describe('eventMiddleware', () => {
        let eventMiddleware;
        let ok;
        let cancel;

        beforeEach(async () => {
            await setup();
            eventMiddleware = new EventMiddleware((_ok, _cancel) => {
                ok = _ok;
                cancel = _cancel;
            });
            clientSocket.use(eventMiddleware);
        });

        it('if ok is called, emit should go through', async () => {
            const result = clientSocket.emit('testEvent', {});
            ok();

            expect(await result).toBe(true);
        });

        it('if event is allowed, emit should go through', async () => {
            const eventName = 'testEvent';
            eventMiddleware.addAllowedEvents(eventName);
            const result = clientSocket.emit(eventName, {});

            expect(await result).toBe(true);
        });

        it('if not active, emit should go through', async () => {
            eventMiddleware.active = false;
            const result = clientSocket.emit('testEvent', {});

            expect(await result).toBe(true);
        });

        it('if cancel is called, emit should not go through', async () => {
            const result = clientSocket.emit('testEvent', {});
            cancel();

            expect(await result).toBe(false);
        });

        it('if event is not allowed and cancel called, emit should not go through', async () => {
            const eventName = 'testEvent';
            eventMiddleware.addAllowedEvents(eventName);
            const result = clientSocket.emit('notTestEvent', {});
            cancel();

            expect(await result).toBe(false);
        });

        it('if event is not allowed and ok called, emit should go through', async () => {
            const eventName = 'testEvent';
            eventMiddleware.addAllowedEvents(eventName);
            const result = clientSocket.emit('notTestEvent', {});
            ok();

            expect(await result).toBe(true);
        });

        it('should forward events to once', (done) => {
            const data = { data: 1 };
            eventMiddleware.emitter.once('testEvent', (_data) => {
                expect(_data).toEqual(data);
                done();
            });
            clientSocket.once('testEvent', () => {});
            serverSocket.emit('testEvent', data);
        });

        it('should forward events to on', (done) => {
            const data = { data: 1 };
            eventMiddleware.emitter.on('testEvent', (_data) => {
                expect(_data).toEqual(data);
                done();
            });
            clientSocket.once('testEvent', () => {});
            serverSocket.emit('testEvent', data);
        });
    });
});
