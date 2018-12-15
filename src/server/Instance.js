// Game Server
import Trace from 'lance/lib/Trace';
import MyServerEngine from './MyServerEngine';
import MyGameEngine from '../common/MyGameEngine';
import { GameStatus as Status } from '../common/types';
import { destroyGame } from './db/views/game';
import logger from './Logger';

export default class Instance {
    constructor(gameId) {
        this.gameId = gameId;
        this.currentPlyers = [];

        this.gameEngine = new MyGameEngine({
            traceLevel: Trace.TRACE_NONE,
            collisionOptions: {
                collisions: {
                    type: 'HSHG',
                    keyObjectDetection: true
                }
            }
        });
        this.gameEngine.setStatus(Status.INITIALIZING);

        this.serverEngine = new MyServerEngine(
            { on: () => {} },
            this.gameEngine,
            {
                debug: {},
                updateRate: 6,
                timeoutInterval: 0
            }
        );

        this.proxyOnPlayerDisconnected(this.serverEngine);

        this.onProcessExit = this.stop.bind(this);
        process.on('exit', this.onProcessExit);

        this.serverEngine.start();
    }

    get isFull() {
        return this.serverEngine.nConnectedPlayers == 2;
    }

    /**
     * @private
     * @param {*} serverEngine
     */
    proxyOnPlayerDisconnected(serverEngine) {
        let serverEngineOnDc = serverEngine.onPlayerDisconnected.bind(
            serverEngine
        );
        serverEngine.onPlayerDisconnected = (socketId, playerId) => {
            serverEngineOnDc(socketId, playerId);
            this.onPlayerDisconnected();
        };
    }

    launch(stopCallback) {
        this.stopCallback = stopCallback;
        this.setState(Status.IN_PROGRESS);
    }

    async stop() {
        logger.info('Stopping instance');
        if (this.stopCallback) {
            this.stopCallback();
        }
        this.gameEngine.stop();
        this.serverEngine.scheduler.stop();
        // @TODO: consider separating database logic, process logic
        await destroyGame(this.gameId);

        process.removeListener('exit', this.onProcessExit);
    }

    suspend() {
        const state = Status.SUSPENDED;
        this.setState(state);
    }

    start() {
        const state = Status.IN_PROGRESS;
        this.setState(state);
    }

    setState(state) {
        this.gameEngine.setStatus(state);
        this.serverEngine.controller.broadcastGameState(state);
    }

    onPlayerDisconnected() {
        if (
            this.gameEngine.status != Status.INITIALIZING &&
            this.serverEngine.nConnectedPlayers == 0
        ) {
            this.stop();
        } else {
            logger.info('Player disconnected. Suspending.');
            this.suspend();
        }
    }

    /**
     * Called before authentication to assign a player number
     * @param {*} socket
     */
    onPlayerConnected(socket) {
        this.serverEngine.onPlayerConnected(socket);
    }

    /**
     * Called after authentication
     * @param {*} socket
     */
    addPlayer(socket, isNew) {
        this.serverEngine.addPlayer(socket, isNew);
    }

    maybeStartGame() {
        if (this.serverEngine.nConnectedPlayers == 2) {
            logger.info('Enough players in the game. Resuming.');
            this.start();
        }
    }
}
