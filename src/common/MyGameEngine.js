'use strict';

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import PlayerAvatar from './PlayerAvatar';
import Avatar from './Avatar';
import BotAvatar from './BotAvatar';
import Blockable from './Blockable';
import TwoVector from 'lance/serialize/TwoVector';
import { resolve } from 'url';

const STEP = 5;
export const WIDTH = 2000;
export const HEIGHT = 1200;

export default class MyGameEngine extends GameEngine {
    constructor(options) {
        super(options);
        this.physicsEngine = new SimplePhysicsEngine({
            ...options.collisionOptions,
            gameEngine: this
        });
        this.problemIdIndex = {};
    }

    isOwnedByPlayer(object) {
        return this.playerId == object.playerNumber;
    }

    registerClasses(serializer) {
        serializer.registerClass(PlayerAvatar);
        serializer.registerClass(Avatar);
        serializer.registerClass(Blockable);
        serializer.registerClass(BotAvatar);
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
            obj.position = new TwoVector(obj.position[0], obj.position[1]);
            let avatar = new Avatar(this, null, obj);
            this.addObjectToWorld(avatar);
            this.addObjToProblemIdIndex(avatar);
        }
    }

    addObjects(objects) {
        for (const obj of objects) {
            this.addObjectToWorld(new Blockable(this, null, obj));
        }
    }

    addBot(options) {
        return this.addObjectToWorld(new BotAvatar(this, null, options));
    }

    makeWalls() {
        for (let i = 0; i < 10; i++) {
            this.addObjectToWorld(
                new Blockable(this, null, {
                    position: new TwoVector(
                        Math.random() * WIDTH,
                        Math.random() * HEIGHT
                    ),
                    width: 200,
                    height: 50
                })
            );
        }
    }

    /**
     * Maps problem ids to objects to efficiently update objects that correspond
     * to a given problem
     * @param {Avatar} obj
     */
    addObjToProblemIdIndex(obj) {
        if (this.problemIdIndex[obj.problemId])
            this.problemIdIndex[obj.problemId].push(obj);
        else this.problemIdIndex[obj.problemId] = [obj];
    }

    makePlayer(playerId, playerNumber) {
        console.log(`adding player ${playerNumber}`);
        return this.addObjectToWorld(
            new PlayerAvatar(this, null, {
                position: new TwoVector(WIDTH / 2, HEIGHT / 2),
                playerId: playerId,
                playerNumber: playerNumber
            })
        );
    }

    makeDefence(defenceId, position) {
        return this.addObjectToWorld(
            new Avatar(this, null, {
                position: position,
                objectType: 'defence',
                dbId: defenceId,
                solvedBy: null
            })
        );
    }

    markAsSolved(problemId, playerId) {
        let objs = this.problemIdIndex[problemId];
        if (objs != undefined) {
            for (const obj of objs) {
                obj.solvedBy = playerId.toString();
            }
        }
    }

    markAsCollected(dbId) {
        let obj = this.queryObject({ dbId: dbId }, Avatar);
        console.log(`Marking ${obj} as collected`);
        obj.collected = 'true';
    }

    causesCollision() {
        let collisionObjects = this.physicsEngine.collisionDetection.detect();
        for (const pair of collisionObjects) {
            let objects = Object.values(pair);
            let object = objects.find((o) => o instanceof Blockable);
            let player = objects.find((o) => o instanceof PlayerAvatar);

            if (!object || !player) continue;
            return true;
        }
        return false;
    }

    getResources(problemId) {
        return this.queryObjects({ problemId: problemId }, Avatar);
    }

    queryObjects(query, targetType, returnSingle = false) {
        let result = [];
        this.world.forEachObject((id, obj) => {
            if (!targetType || obj instanceof targetType) {
                for (const key of Object.keys(query)) {
                    if (obj[key] == query[key]) {
                        if (returnSingle) {
                            result = obj;
                            return false;
                        }
                        result.push(obj);
                    }
                }
            }
        });
        if (returnSingle && result.length == 0) {
            return null;
        }
        return result;
    }

    queryObject(query, targetType) {
        return this.queryObjects(query, targetType, true);
    }

    processInput(inputData, playerId) {
        super.processInput(inputData, playerId);

        // get the player's primary object
        let player = this.queryObject({ playerNumber: playerId });
        if (player) {
            this.trace.info(
                () => `player ${playerId} pressed ${inputData.input}`
            );
            let { x, y } = player.position;

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

            let shouldRevert = this.causesCollision();
            if (shouldRevert) {
                this.trace.info(
                    () =>
                        `reverting position: ${player.position.x},${
                            player.position.y
                        }
                    } => ${x},${y}`
                );
                player.position.x = x;
                player.position.y = y;
            }
        }
    }
}
