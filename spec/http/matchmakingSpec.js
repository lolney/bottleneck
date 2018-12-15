import { MatchmakingRouter } from '../../src/server/routers/matchmaking';
import request from 'supertest';
import express from 'express';

describe('Matchmaking', () => {
    let router;
    let routerObject;
    let app;

    beforeEach(() => {
        app = express();
        routerObject = new MatchmakingRouter();
        router = routerObject.router;
        app.use(router);
    });

    it('responds with error when querystring not supplied', (done) => {
        request(app)
            .post('/match')
            .expect(500)
            .end(done);
    });

    it('terminates properly', (done) => {
        request(app)
            .post('/match?mode=vs')
            .timeout(100)
            .expect(200, (err) => {
                expect(err.code).toEqual('ECONNABORTED');
                expect(routerObject.matchmaker.queuedPlayers.length).toEqual(0);
                done();
            });
    });

    it('responds with gameId after two players join', async () => {
        let reqs = await Promise.all(
            [0, 1].map((i) =>
                request(app)
                    .post('/match?mode=vs')
                    .expect(200)
            )
        );
        let urls = reqs.map((res) => res.body.serverURL);
        let cookies = reqs.map((res) => res.headers['set-cookie']);

        expect(urls[0]).toEqual(urls[1]);
        expect(cookies[0]).toEqual(cookies[1]);

        expect(cookies[0][0]).toContain('gameId');
    });
});
