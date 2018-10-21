'use strict';

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import PlayerAvatar from './PlayerAvatar';
import Avatar from './Avatar';
import CollectionBotAvatar from './CollectionBotAvatar';
import BotAvatar from './BotAvatar';
import Blockable from './Blockable';
import DefenceAvatar from './DefenceAvatar';
import AssaultBotAvatar from './AssaultBotAvatar';
import PlayerBaseAvatar from './PlayerBaseAvatar';

import TwoVector from 'lance/serialize/TwoVector';
import { WIDTH, HEIGHT, getSiegeItemFromId } from '../config';

const STEP = 5;

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
        serializer.registerClass(DefenceAvatar);
        serializer.registerClass(Blockable);
        serializer.registerClass(CollectionBotAvatar);
        serializer.registerClass(AssaultBotAvatar);
        serializer.registerClass(PlayerBaseAvatar);
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
        let Type;
        switch (options.type) {
        case 'assault':
            Type = AssaultBotAvatar;
            break;
        case 'collector':
            Type = CollectionBotAvatar;
            break;
        default:
            throw new Error('Unexpected type');
        }
        return this.addObjectToWorld(new Type(this, null, options));
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
        let siegeItem = getSiegeItemFromId(defenceId);
        console.log('adding siegeItem: ', siegeItem);
        let obj = this.addObjectToWorld(
            new DefenceAvatar(this, null, {
                position: position,
                objectType: siegeItem.name,
                behaviorType: 'defence',
                dbId: defenceId,
                collected: false
            })
        );

        this.resetBots();

        return obj;
    }

    async resetBots() {
        let bots = this.queryObjects({}, BotAvatar);
        await Promise.all(bots.map((bot) => bot.resetPath()));
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

    /**
     * Decrement the health of an enemy base
     * @param {number} enemyPlayerId
     */
    setBaseHP(enemyPlayerNumber, hp) {
        let obj = this.queryObject(
            { playerNumber: enemyPlayerNumber },
            PlayerBaseAvatar
        );
        obj.hp = hp;
    }

    causesCollision() {
        let collisionObjects = this.physicsEngine.collisionDetection.detect();
        for (const pair of collisionObjects) {
            let objects = Object.values(pair);
            let object = objects.find((o) => o.blocks());
            let player = objects.find((o) => o instanceof PlayerAvatar);

            if (!object || !player) continue;
            return true;
        }
        return false;
    }

    getResources(problemId) {
        return this.queryObjects({ problemId: problemId }, Avatar);
    }

    getPlayerByNumber(playerNumber) {
        return this.queryObject({ playerNumber: playerNumber }, PlayerAvatar);
    }

    queryObjects(query, targetType, returnSingle = false) {
        let result = [];
        this.world.forEachObject((id, obj) => {
            if (!targetType || obj instanceof targetType) {
                let found = true;
                for (const key of Object.keys(query)) {
                    if (obj[key] != query[key]) {
                        found = false;
                        break;
                    }
                }
                if (found) {
                    if (returnSingle) {
                        result = obj;
                        return false;
                    }
                    result.push(obj);
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
