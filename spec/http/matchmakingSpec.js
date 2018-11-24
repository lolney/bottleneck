import matchmakingRouter from '../../src/server/routers/matchmaking';
import request from 'supertest';
import express from 'express';

describe('Matchmaking', () => {
    let router;
    let app;

    beforeEach(() => {
        app = express();
        router = matchmakingRouter();
        app.use(router);
    });

    it('responds with error when querystring not supplied', (done) => {
        request(app)
            .post('/find_game')
            .expect(500)
            .end(done);
    });

    it('terminates properly', (done) => {
        request(app)
            .post('/find_game?mode=vs')
            .timeout(100)
            .expect(200, (err) => {
                expect(err.code).toEqual('ECONNABORTED');
                done();
            });
    });

    it('responds to requests after two players join', async () => {
        let reqs = await Promise.all(
            [0, 1].map((i) =>
                request(app)
                    .post('/find_game?mode=vs')
                    .expect(200)
            )
        );
        let urls = reqs.map((res) => res.body.serverURL);

        expect(urls[0]).toEqual(urls[1]);
    });
});
