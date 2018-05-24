'use strict';

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import PlayerAvatar from './PlayerAvatar';
import Avatar from './Avatar';
import TwoVector from 'lance/serialize/TwoVector';

const STEP = 5;
const WIDTH = 1000;
const HEIGHT = 600;

export default class MyGameEngine extends GameEngine {

    constructor(options) {
        super(options);
        this.physicsEngine = new SimplePhysicsEngine({ gameEngine: this });
    }

    registerClasses(serializer) {
        serializer.registerClass(PlayerAvatar);
        serializer.registerClass(Avatar);
    }

    start() {

        super.start();
        this.makeTrees();

        this.worldSettings = {
            worldWrap: true,
            width: WIDTH,
            height: HEIGHT
        };
    }

    makeTrees() {
        for (let i = 0; i < 10; i++) {
            this.addObjectToWorld(
                new Avatar(
                    this,
                    null,
                    {
                        position: new TwoVector(Math.random() * WIDTH, Math.random() * HEIGHT),
                        objectType: 'tree',
                    }
                )
            );
        }
    }

    makePlayer(playerId) {
        console.log(`adding player ${playerId}`);
        this.addObjectToWorld(
            new PlayerAvatar(
                this,
                null,
                {
                    position: new TwoVector(WIDTH / 2, HEIGHT / 2),
                    playerId: playerId
                }
            )
        );
    }

    processInput(inputData, playerId) {

        super.processInput(inputData, playerId);

        // get the player's primary object
        let player = this.world.queryObject({ playerId });
        if (player) {
            this.trace.info(() => `player ${playerId} pressed ${inputData.input}`);
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
