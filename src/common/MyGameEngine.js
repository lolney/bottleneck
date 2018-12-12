'use strict';

import GameEngine from 'lance/GameEngine';
import SimplePhysicsEngine from 'lance/physics/SimplePhysicsEngine';
import PlayerAvatar from './PlayerAvatar';
import Avatar from './Avatar';
import CollectionBotAvatar from './CollectionBotAvatar';
import BotAvatar from './BotAvatar';
import WallAvatar from './WallAvatar';
import DefenseAvatar from './DefenseAvatar';
import AssaultBotAvatar from './AssaultBotAvatar';
import PlayerBaseAvatar from './PlayerBaseAvatar';
import WaterAvatar from './WaterAvatar';

import TwoVector from 'lance/serialize/TwoVector';
import { WIDTH, HEIGHT, getSiegeItemFromId } from '../config';

/** This is only used server-side */
export const Status = {
    INITIALIZING: Symbol('initializing'),
    IN_PROGRESS: Symbol('in progress'),
    DONE: Symbol('done')
};

export default class MyGameEngine extends GameEngine {
    constructor(options) {
        super(options);
        this.physicsEngine = new SimplePhysicsEngine({
            ...options.collisionOptions,
            gameEngine: this
        });
        this.problemIdIndex = {};
    }

    setStatus(status) {
        this.status = status;
    }

    isOwnedByPlayer(object) {
        return this.playerId == object.playerNumber;
    }

    registerClasses(BaseTypes) {
        BaseTypes.registerClass(PlayerAvatar);
        BaseTypes.registerClass(Avatar);
        BaseTypes.registerClass(DefenseAvatar);
        BaseTypes.registerClass(WallAvatar);
        BaseTypes.registerClass(CollectionBotAvatar);
        BaseTypes.registerClass(AssaultBotAvatar);
        BaseTypes.registerClass(PlayerBaseAvatar);
        BaseTypes.registerClass(WaterAvatar);
    }

    start() {
        super.start();

        this.worldSettings = {
            worldWrap: true,
            width: WIDTH,
            height: HEIGHT
        };
    }

    static botTypeToAvatarClass(type) {
        switch (type) {
        case 'assaultBot':
            return AssaultBotAvatar;
        case 'collectionBot':
            return CollectionBotAvatar;
        default:
            throw new Error(`Unexpected type: ${type}`);
        }
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
            let Type;
            switch (obj.type) {
            case 'wall':
                Type = WallAvatar;
                break;
            case 'water':
                Type = WaterAvatar;
                break;
            case 'siegeItem':
                Type = DefenseAvatar;
                break;
            default:
                throw new Error(`Unexpected type: ${obj.type}`);
            }
            this.addObjectToWorld(new Type(this, null, obj));
        }
    }

    addBot(options) {
        let Type = MyGameEngine.botTypeToAvatarClass(options.type);
        return this.addObjectToWorld(new Type(this, null, options));
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

    makePlayer(playerId, playerNumber, baseLocation) {
        console.log(`adding player ${playerNumber}`);
        this.addObjectToWorld(
            new PlayerBaseAvatar(this, null, {
                position: baseLocation,
                playerId: playerId,
                playerNumber: playerNumber
            })
        );
        return this.addObjectToWorld(
            new PlayerAvatar(this, null, {
                position: baseLocation,
                playerId: playerId,
                playerNumber: playerNumber
            })
        );
    }

    makeDefense(defenseId, position, playerNumber) {
        let siegeItem = getSiegeItemFromId(defenseId);
        console.log('adding siegeItem: ', siegeItem);
        let obj = new DefenseAvatar(this, null, {
            position: position,
            objectType: siegeItem.name,
            behaviorType: siegeItem.type,
            blockingBehavior: siegeItem.behavior,
            width: siegeItem.width,
            height: siegeItem.height,
            dbId: defenseId,
            collected: false,
            playerNumber: playerNumber
        });
        this.addObjectToWorld(obj);

        return obj;
    }

    async resetBots() {
        let bots = this.queryObjects({}, BotAvatar);
        await Promise.all(bots.map((bot) => bot.resetPath()));
    }

    detachBots() {
        let bots = this.queryObjects({}, BotAvatar);
        bots.forEach((bot) => bot.detach());
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
    setBaseHP(enemyPlayerId, hp) {
        let obj = this.queryObject(
            { playerId: enemyPlayerId },
            PlayerBaseAvatar
        );
        obj.hp = hp;
    }

    causesCollision() {
        let collisionObjects = this.physicsEngine.collisionDetection.detect();
        for (const pair of collisionObjects) {
            let objects = Object.values(pair);
            let object = objects.find((o) => o.blocks);
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

    /**
     * @param {number} playerNumber
     * @param {string} type
     * @returns {number} - The number of bots of `type` belonging to `player`
     */
    getNBots(playerNumber, type) {
        return this.queryObjects(
            { playerNumber: playerNumber },
            MyGameEngine.botTypeToAvatarClass(type)
        ).length;
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

    registerCollisionStart(condition1, condition2, handler) {
        return this.registerCollisionHandler(
            'collisionStart',
            condition1,
            condition2,
            handler
        );
    }

    registerCollisionStop(condition1, condition2, handler) {
        return this.registerCollisionHandler(
            'collisionStop',
            condition1,
            condition2,
            handler
        );
    }

    removeCollisionStop(handler) {
        this.removeCollisionHandler('collisionStop', handler);
    }

    removeCollisionStart(handler) {
        this.removeCollisionHandler('collisionStart', handler);
    }

    /**
     * @private
     */
    registerCollisionHandler(verb, condition1, condition2, handler) {
        let registeredHandler = (e) => {
            let collisionObjects = Object.keys(e).map((k) => e[k]);
            let o1 = collisionObjects.find(condition1);
            let o2 = collisionObjects.find(condition2);

            if (!o1 || !o2) return;

            handler(o1, o2);
        };
        this.on(verb, registeredHandler);
        return registeredHandler;
    }

    /**
     * @private
     */
    removeCollisionHandler(verb, handler) {
        this.removeListener(verb, handler);
    }

    processInput(inputData, playerId) {
        super.processInput(inputData, playerId);
        // get the player's primary object
        let player = this.queryObject({ playerNumber: playerId }, PlayerAvatar);
        if (player) {
            this.trace.info(
                () => `player ${playerId} pressed ${inputData.input}`
            );
            let { x, y } = player.position;
            let step = player.speed;

            if (inputData.input === 'up') {
                player.position.y -= step;
            } else if (inputData.input === 'down') {
                player.position.y += step;
            } else if (inputData.input === 'right') {
                if (player.actor) {
                    player.actor.sprite.scale.set(1, 1);
                }
                player.position.x += step;
            } else if (inputData.input === 'left') {
                if (player.actor) {
                    player.actor.sprite.scale.set(-1, 1);
                }
                player.position.x -= step;
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
