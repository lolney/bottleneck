import express from 'express';
import socketIO from 'socket.io';
import path from 'path';
import MatchMaker from './src/server/MatchMaker';
import InstanceManager from './src/server/InstanceManager';
import logger from './src/server/Logger';

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, '/static');
const ASSETS = path.join(__dirname, '/assets');
const DIST = path.join(__dirname, '/dist');

// define routes and socket
const server = express();
let requestHandler = server.listen(PORT, () =>
    logger.info(`Listening on ${PORT}`)
);

const io = socketIO(requestHandler);

const manager = new InstanceManager(io);
const matchmaker = new MatchMaker(manager);

server.use(express.static(INDEX));
server.use('/assets', express.static(ASSETS));
server.use('/dist', express.static(DIST));

server.post('/find_game', async (req, res) => {
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
});
