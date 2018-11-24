import logger from './Logger';

const MAX_QUEUE_LENGTH = 2;

export default class MatchMaker {
    constructor(instanceManager) {
        this.instanceManager = instanceManager;
        this.reset();
    }

    reset() {
        this.queuedPlayers = [];
    }

    static createResponse(token) {
        return { status: 'ok', serverURL: `/?gameid=${token}` };
    }

    async finalize() {
        logger.info('Enough players have joined. Starting the game.');

        const id = await this.instanceManager.createInstance();
        for (const callback of this.queuedPlayers) {
            callback(MatchMaker.createResponse(id));
        }
        this.reset();
    }

    onPlayerDisconnected(index) {
        logger.info(`Removing player from queue: ${index}`);

        this.queuedPlayers.splice(index, 1);
    }

    async createPractice() {
        logger.info('Creating practice mode server');

        const id = await this.instanceManager.createInstance({
            practice: true
        });
        return MatchMaker.createResponse(id);
    }

    cancel(callback) {
        let index = this.queuedPlayers.findIndex(
            (target) => target == callback
        );

        if (index == -1) {
            throw new Error('Could not remove player from queue');
        } else {
            this.onPlayerDisconnected(index);
        }
    }

    async queue(callback) {
        let qp = this.queuedPlayers;

        if (qp.length < MAX_QUEUE_LENGTH) {
            this.queuedPlayers.push(callback);
        } else {
            throw new Error(`Too many players in queue: ${qp.length}`);
        }

        logger.info(`Player joined the queue. Queue length: ${qp.length}`);
        if (qp.length == MAX_QUEUE_LENGTH) {
            await this.finalize();
        }
    }
}
