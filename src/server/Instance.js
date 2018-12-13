// Game Server
import Trace from 'lance/lib/Trace';
import MyServerEngine from './MyServerEngine';
import MyGameEngine from '../common/MyGameEngine';
import { GameStatus as Status } from '../common/types';
import logger from './Logger';

export default class Instance {
    // Game Instances
    constructor() {
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
        // Proxy onPlayerDisconnected
        let ondc = this.serverEngine.onPlayerDisconnected.bind(
            this.serverEngine
        );
        this.serverEngine.onPlayerDisconnected = (socketId, playerId) => {
            ondc(socketId, playerId);
            this.onPlayerDisconnected();
        };

        this.currentPlyers = [];
        this.serverEngine.start();
    }

    launch(stopCallback) {
        this.stopCallback = stopCallback;
        this.setState(Status.IN_PROGRESS);
    }

    stop() {
        logger.info('Stopping instance');
        if (this.stopCallback) this.stopCallback();
        this.gameEngine.stop();
        this.serverEngine.scheduler.stop();
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
            Object.keys(this.serverEngine.connectedPlayers).length == 0
        ) {
            this.stop();
        } else {
            this.suspend();
        }
    }

    onPlayerConnected(socket) {
        if (Object.keys(this.serverEngine.connectedPlayers).length == 0) {
            this.start();
        }
        this.serverEngine.onPlayerConnected(socket);
    }
}
