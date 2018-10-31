// Game Server
import Trace from 'lance/lib/Trace';
import MyServerEngine from './MyServerEngine';
import MyGameEngine from '../common/MyGameEngine';

export default class Instance {
    // Game Instances
    constructor() {
        this.gameEngine = new MyGameEngine({
            traceLevel: Trace.TRACE_NONE,
            collisionOptions: {
                collisions: {
                    type: 'HSHG'
                }
            }
        });
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
        this.launched = false;
        this.serverEngine.start();
    }

    launch() {
        this.launched = true;
    }

    stop() {
        console.log('Stopping instance');
        this.gameEngine.stop();
        this.serverEngine.scheduler.stop();
    }

    onPlayerDisconnected() {
        if (
            this.launched &&
            Object.keys(this.serverEngine.connectedPlayers).length == 0
        ) {
            this.stop();
        }
    }

    onPlayerConnected(socket) {
        this.serverEngine.onPlayerConnected(socket);
    }
}
