import models from '../models';

export async function createGame() {
    return models.game.create();
}

export async function destroyGame(id) {
    let game = await models.game.find({ where: { id } });
    return game.destroy();
}
