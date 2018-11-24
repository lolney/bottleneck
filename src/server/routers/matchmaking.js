import express from 'express';
import MatchMaker from '../MatchMaker';
import InstanceManager from '../InstanceManager';

export default function matchmakingRouter(io) {
    const router = express.Router();
    const manager = new InstanceManager(io);
    const matchmaker = new MatchMaker(manager);

    router.post('/find_game', async (req, res) => {
        if (!req.query) {
            res.status(500).send('Must include querystring');
        } else {
            const mode = req.query.mode;

            switch (mode) {
            case 'vs':
                var callback = (resp) => {
                    res.json(resp);
                };
                matchmaker.queue(callback);
                req.on('aborted', () => {
                    matchmaker.cancel(callback);
                });
                break;
            case 'practice':
                var resp = await matchmaker.createPractice();
                res.json(resp);
                break;
            default:
                res.status(500).send('Must include mode parameter');
            }
        }
    });

    return router;
}
