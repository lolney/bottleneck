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
        this.serverEngine.start();
    }

    onPlayerConnected(io) {
        this.serverEngine.onPlayerConnected(io);
    }
}
