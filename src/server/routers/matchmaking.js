import express from 'express';
import MatchMaker from '../MatchMaker';
import InstanceManager from '../InstanceManager';

export class MatchmakingRouter {
    constructor(io) {
        this.manager = new InstanceManager(io);
        this.matchmaker = new MatchMaker(this.manager);
    }

    handleVs(res, req) {
        const callback = (resp) => {
            res.json(resp);
        };
        this.matchmaker.queue(callback);
        req.on('aborted', () => {
            this.matchmaker.cancel(callback);
        });
    }

    async handlePractice(res, req) {
        const resp = await this.matchmaker.createPractice();
        res.json(resp);
    }

    get router() {
        const router = express.Router();

        router.post('/match', async (req, res) => {
            if (!req.query) {
                res.status(500).send('Must include querystring');
            } else {
                const mode = req.query.mode;

                switch (mode) {
                case 'vs':
                    this.handleVs(res, req);
                    break;
                case 'practice':
                    await this.handlePractice(res, req);
                    break;
                default:
                    res.status(500).send('Must include mode parameter');
                }
            }
        });

        return router;
    }
}

export default function makeRouter(io) {
    return new MatchmakingRouter(io).router;
}
