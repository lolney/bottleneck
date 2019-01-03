import ClientEngine from 'lance/ClientEngine';
import MyRenderer from './MyRenderer';
import KeyboardControls from 'lance/controls/KeyboardControls';
import Router from './Router';
import Socket from '../common/Socket';

export default class MyClientEngine extends ClientEngine {
    constructor(gameEngine, options, renderer = MyRenderer) {
        super(gameEngine, options, renderer);

        this.controls = new KeyboardControls(this);
        this.controls.bindKey('up', 'up', { repeat: true });
        this.controls.bindKey('down', 'down', { repeat: true });
        this.controls.bindKey('left', 'left', { repeat: true });
        this.controls.bindKey('right', 'right', { repeat: true });
    }

    async start() {
        await super.start();
        const socket = new Socket(this.socket, false);
        this.router = new Router(socket);
        return socket;
    }
}
