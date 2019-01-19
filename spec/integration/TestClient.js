import ClientEngine from '../../src/client/MyClientEngine';
import MyGameEngine from '../../src/common/MyGameEngine';
import PlayerAvatar from '../../src/common/MyGameEngine';
import { clientDefaults } from '../../src/config';

class TestRenderer {
    draw() {}
    async init() {}
    stop() {}
}

export default class TestClient {
    constructor(url) {
        window.requestAnimationFrame = () => {};
        this.gameEngine = new MyGameEngine(clientDefaults);
        this.clientEngine = new ClientEngine(
            this.gameEngine,
            // can set `scheduler: 'fixed'` to get network updates,
            // but this doesn't work in the node environment
            { ...clientDefaults, serverURL: url, auth: { token: 'token' } },
            TestRenderer
        );
    }

    get player() {
        return this.gameEngine.queryObject(
            { playerNumber: this.gameEngine.playerId },
            PlayerAvatar
        );
    }

    async start() {
        const { socket } = await this.clientEngine.start();
        this.socket = socket;
        this.router = this.clientEngine.router;
        return this.socket;
    }

    spawnBot() {
        this.socket.emit('makeAssaultBot');
    }
}
