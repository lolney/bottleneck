import ClientEngine from '../../src/client/MyClientEngine';
import MyGameEngine from '../../src/common/MyGameEngine';
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
            { ...clientDefaults, serverURL: url },
            TestRenderer
        );
    }

    async start() {
        this.socket = await this.clientEngine.start();
        return this.socket;
    }

    spawnBot() {
        this.socket.emit('makeAssaultBot');
    }
}
