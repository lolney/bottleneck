'use strict';

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import PlayerAvatar from './PlayerAvatar';
import Avatar from './Avatar';
import TwoVector from 'lance/serialize/TwoVector';

const STEP = 5;
export const WIDTH = 2000;
export const HEIGHT = 1200;

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

        this.worldSettings = {
            worldWrap: true,
            width: WIDTH,
            height: HEIGHT
        };
    }

    makeTrees(objects) {
        for (let obj of objects) {
            this.addObjectToWorld(new Avatar(this, null, obj));
        }
    }

    makePlayer(playerId) {
        console.log(`adding player ${playerId}`);
        this.addObjectToWorld(
            new PlayerAvatar(this, null, {
                position: new TwoVector(WIDTH / 2, HEIGHT / 2),
                playerId: playerId
            })
        );
    }

    processInput(inputData, playerId) {
        super.processInput(inputData, playerId);

        // get the player's primary object
        let player = this.world.queryObject({ playerId: playerId });
        if (player) {
            this.trace.info(
                () => `player ${playerId} pressed ${inputData.input}`
            );
            if (inputData.input === 'up') {
                player.position.y -= STEP;
            } else if (inputData.input === 'down') {
                player.position.y += STEP;
            } else if (inputData.input === 'right') {
                if (player.actor) {
                    player.actor.sprite.scale.set(1, 1);
                }
                player.position.x += STEP;
            } else if (inputData.input === 'left') {
                if (player.actor) {
                    player.actor.sprite.scale.set(-1, 1);
                }
                player.position.x -= STEP;
            }
        }
    }
}
