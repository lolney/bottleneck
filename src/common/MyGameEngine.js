'use strict';

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import PlayerAvatar from './PlayerAvatar';
import GameObject from './GameObject';
import DummyPlayer from './DummyPlayer';
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
        serializer.registerClass(DummyPlayer);
        serializer.registerClass(GameObject);
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
            let avatar = new GameObject(this, null, obj);
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
     * @param {GameObject} obj
     */
    addObjToProblemIdIndex(obj) {
        if (this.problemIdIndex[obj.problemId])
            this.problemIdIndex[obj.problemId].push(obj);
        else this.problemIdIndex[obj.problemId] = [obj];
    }

    makePlayer(playerId, playerNumber) {
        console.log(`adding player ${playerNumber}`);
        let start = new TwoVector(WIDTH / 2, HEIGHT / 2);
        this.addObjectToWorld(
            new DummyPlayer(this, null, {
                position: start.clone(),
                playerNumber: playerNumber
            })
        );
        return this.addObjectToWorld(
            new PlayerAvatar(this, null, {
                position: start,
                playerId: playerId,
                playerNumber: playerNumber
            })
        );
    }

    makeDefence(defenceId, position) {
        return this.addObjectToWorld(
            new GameObject(this, null, {
                position: position,
                objectType: 'google',
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
        let obj = this.queryObject({ dbId: dbId });
        obj.collected = 'true';
    }

    causesCollision() {
        let collisionObjects = this.physicsEngine.collisionDetection.detect();
        if (collisionObjects.length > 0) console.log(collisionObjects);
        for (const pair of collisionObjects) {
            let objects = Object.values(pair);
            let object = objects.find((o) => o instanceof Blockable);
            let player = objects.find((o) => o instanceof PlayerAvatar);
            let dummy = objects.find((o) => o instanceof DummyPlayer);

            if (dummy) console.log('dummy', dummy.position);
            if (player) console.log('player', player.position);
            if (!object || !player) continue;
            return true;
        }
        return false;
    }

    // TODO: doesn't actually find closest resource
    closestResource(problemId) {
        return this.queryObject({ problemId: problemId });
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
        let player = this.queryObject({ playerNumber: playerId }, PlayerAvatar);
        let dummy = this.queryObject({ playerNumber: playerId }, DummyPlayer);
        if (player && dummy) {
            this.trace.info(
                () => `player ${playerId} pressed ${inputData.input}`
            );

            dummy.position = player.position.clone();
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

            let collision = this.causesCollision();
            if (collision) {
                console.log(
                    'collision, dummy, player',
                    dummy.position,
                    player.position
                );
                this.trace.info(
                    () =>
                        `reverting position: ${player.position.x},${
                            player.position.y
                        }`
                );
                player.position = dummy.position.clone();
            } else {
                dummy.position = player.position.clone();
            }
        }
    }
}
