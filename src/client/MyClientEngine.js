import ClientEngine from 'lance/ClientEngine';
import MyRenderer from './MyRenderer';
import KeyboardControls from 'lance/controls/KeyboardControls';
import Router from './Router';
import Socket from '../common/Socket';
import Avatar from '../common/Avatar';
import BotAvatar from '../common/BotAvatar';
import TutorialArrow from '../common/TutorialArrow';
import { waterDummy } from '../config';
import DefenseAvatar from '../common/DefenseAvatar';

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
        const gameApi = new GameAPI(this.gameEngine, this.renderer);

        return { socket, gameApi };
    }
}

class GameAPI {
    constructor(gameEngine, renderer) {
        this.gameEngine = gameEngine;
        this.renderer = renderer;
    }

    queryObject(query) {
        const objects = this.gameEngine.queryObjects(query, Avatar);
        const playerPosition = this.renderer.playerPosition;
        const distances = {};
        for (const obj of objects) {
            distances[obj.id] = BotAvatar.distance(
                playerPosition,
                obj.position
            );
        }
        const sorted = objects.sort(
            (a, b) => distances[a.id] - distances[b.id]
        );
        return sorted[0];
    }

    getCenter() {
        const water = this.gameEngine.queryObject(
            { objectType: waterDummy.name },
            DefenseAvatar
        );

        return water.position;
    }

    removeObject(obj) {
        this.gameEngine.removeObjectFromWorld(obj.id);
    }

    addArrow(position, direction) {
        return this.gameEngine.addObjectToWorld(
            new TutorialArrow(this.gameEngine, null, {
                position,
                direction
            })
        );
    }

    coordsInBounds(vec) {
        return (
            vec.x > 0 &&
            vec.y > 0 &&
            vec.x < this.renderer.viewportWidth &&
            vec.y < this.renderer.viewportHeight
        );
    }

    worldToCanvasCoordinates(x, y) {
        return this.renderer.worldToCanvasCoordinates(x, y);
    }
}
