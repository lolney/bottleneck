import InstanceManager from '../../src/server/InstanceManager';

describe('InstanceManager', () => {
    let instanceManager;

    beforeAll(async () => {
        instanceManager = new InstanceManager();
    });

    it('adds player to created instance', () => {
        const id = instanceManager.createInstance();

        const socket = {
            handshake: { query: { gameid: id } },
            emit: () => {},
            on: () => {}
        };

        instanceManager.onPlayerConnected(socket);

        const sockets = Object.values(
            instanceManager.instances[id].serverEngine.players
        ).filter((player) => player);

        expect(sockets[0]).toEqual(socket);
    });

    it('returns an error if instance not found', () => {});

    it('removes instance when shut down', () => {
        const id = instanceManager.createInstance();
        instanceManager.instances[id].stop();

        expect(Object.values(instanceManager.instances).length).toEqual(0);
    });
});
