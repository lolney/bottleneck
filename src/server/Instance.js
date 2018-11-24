// Game Server
import Trace from 'lance/lib/Trace';
import MyServerEngine from './MyServerEngine';
import MyGameEngine, { Status } from '../common/MyGameEngine';

export default class Instance {
    // Game Instances
    constructor(stopCallback) {
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
        this.stopCallback = stopCallback;
        this.currentPlyers = [];
        this.serverEngine.start();
    }

    launch() {
        this.gameEngine.setStatus(Status.IN_PROGRESS);
    }

    stop() {
        console.log('Stopping instance');
        this.stopCallback();
        this.gameEngine.stop();
        this.serverEngine.scheduler.stop();
    }

    onPlayerDisconnected() {
        if (
            this.gameEngine.status != Status.INITIALIZING &&
            Object.keys(this.serverEngine.connectedPlayers).length == 0
        ) {
            this.stop();
        }
    }

    onPlayerConnected(socket) {
        this.serverEngine.onPlayerConnected(socket);
    }
}
