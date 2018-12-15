import models from '../models';
import db from '../models';
import { getDataValues } from '..';
import { playerBase, assaultBot } from '../../../config';

/**
 * Gets player, created it if not yet created
 * @param {string} userId
 * @param {number} number
 * @param {string} gameId
 * @param {TwoVector} options.location
 * @returns {*} - the player
 */
export async function getPlayer(userId, number, gameId, options = {}) {
    let player;

    player = await models.player.find({
        where: { gameId, userId }
    });

    if (!player) {
        player = await createPlayer(userId, number, gameId, options.location);
    }

    return player;
}

export async function doesPlayerExist(userId, gameId) {
    let player = await models.player.find({
        where: { gameId, userId }
    });

    return player != undefined;
}

/**
 * Creates player with the provided number and associates it with user,
 * returning the newly-created player
 * @param {*} userId
 * @param {*} number
 * @param {*} gameId
 * @param {*} location
 */
export async function createPlayer(userId, number, gameId, location) {
    let sequelizeLocation = !location
        ? null
        : db.Sequelize.fn(
            'ST_GeomFromText',
            `POINT(${location.x} ${location.y})`
        );

    let game = await models.game.find({ where: { id: gameId } });

    let player = await models.player.create({
        playerNumber: Number(number),
        location: sequelizeLocation
    });
    let user = await models.user.find({ where: { id: userId } });

    let base = await models.base.create({
        location: sequelizeLocation,
        hp: playerBase.baseHP
    });
    let stone = await models.resource.create({
        parent: 'player',
        name: 'stone',
        count: 10
    });
    let wood = await models.resource.create({
        parent: 'player',
        name: 'wood',
        count: 10
    });
    await Promise.all([
        player.setUser(user),
        player.setBase(base),
        player.setGame(game),
        await wood.setPlayer(player),
        await stone.setPlayer(player)
    ]);

    return player;
}

export async function getPlayerResources(playerId) {
    let player = await models.player.find({ where: { id: playerId } });
    return player.getResources();
}

/**
 * Add `count` to the current resource count for player `playerId`
 * @returns {Number} - the new resource count
 */
export async function addToResourceCount(playerId, resourceName, count) {
    // playerResource of id resourceId associated with player
    let raw = await models.player.find({
        where: { id: playerId },
        include: [
            {
                model: models.resource,
                where: { name: resourceName }
            }
        ]
    });
    let obj = getDataValues(raw);
    let resource = obj.resources[0];
    let newCount = resource.count + count;
    if (newCount < 0) {
        throw new Error(`Resource count would be negative: ${newCount}`);
    }
    await models.resource.update(
        { count: newCount },
        { where: { id: resource.id } }
    );
    return newCount;
}

/**
 * Decrement player base HP by the amount that an assault bot deducts
 * @param {number} playerNumber
 * @returns {number} The updated HP
 */
export async function decrementHP(playerId) {
    let player = await models.player.find({
        where: { id: playerId }
    });
    let base = await player.getBase();
    let hp = base.hp - assaultBot.damage;
    if (hp < 0) {
        hp = 0;
    }
    await models.base.update({ hp: hp }, { where: { id: base.id } });
    return hp;
}

export async function deletePlayerId(userId, playerId) {}
