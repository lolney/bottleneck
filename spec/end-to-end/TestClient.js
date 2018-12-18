import ClientEngine from '../../src/client/MyClientEngine';
import Router from '../../src/client/Router';
import MyGameEngine from '../../src/common/MyGameEngine';
import PlayerAvatar from '../../src/common/MyGameEngine';
import { clientDefaults } from '../../src/config';
import Socket from '../../src/common/Socket';

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
            { ...clientDefaults, serverURL: url },
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
        this.socket = new Socket(await this.clientEngine.start(), false);
        this.router = new Router(this.socket);
        return this.socket;
    }

    spawnBot() {
        this.socket.emit('makeAssaultBot');
    }
}
