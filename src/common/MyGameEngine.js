'use strict';

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import PlayerAvatar from './PlayerAvatar';
import TwoVector from 'lance/serialize/TwoVector';

const STEP = 5;
const WIDTH = 400;
const HEIGHT = 400;

export default class MyGameEngine extends GameEngine {

    constructor(options) {
        super(options);
        this.physicsEngine = new SimplePhysicsEngine({ gameEngine: this });
    }

    registerClasses(serializer) {
        serializer.registerClass(PlayerAvatar);
    }

    start() {

        super.start();

        this.worldSettings = {
            width: WIDTH,
            height: HEIGHT
        };
    }

    initGame() {
        // create the player object
        this.addObjectToWorld(
            new PlayerAvatar(
                this,
                null,
                {
                    position: new TwoVector(WIDTH / 2, HEIGHT / 2),
                    playerId: 1
                }
            )
        );
    }

    processInput(inputData, playerId) {

        super.processInput(inputData, playerId);

        // get the player's primary object
        let player = this.world.queryObject({ playerId });
        if (player) {
            console.log(`player ${playerId} pressed ${inputData.input}`);
            if (inputData.input === 'up') {
                player.position.y -= STEP;
            } else if (inputData.input === 'down') {
                player.position.y += STEP;
            } else if (inputData.input === 'right') {
                player.position.x += STEP;
            } else if (inputData.input === 'left') {
                player.position.x -= STEP;
            } else if (inputData.input === 'space') {
                this.fire(player, inputData.messageIndex);
                this.emit('fire');
            }
        }
    }
}
