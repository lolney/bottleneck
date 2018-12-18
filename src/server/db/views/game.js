import models from '../models';
import logger from '../../Logger';

export async function createGame() {
    return models.game.create();
}

export async function destroyGame(id) {
    let game = await models.game.find({ where: { id } });
    logger.info(`Destroying game ${game.id}`);
    return game.destroy();
}
