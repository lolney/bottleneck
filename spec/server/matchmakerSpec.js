import MatchMaker from '../../src/server/MatchMaker';

describe('MatchMaker', () => {
    let matchMaker;
    let instanceManager;
    let created;

    beforeAll(async () => {
        created = false;
        instanceManager = {
            createInstance: () => {
                created = true;
            }
        };
        matchMaker = new MatchMaker(instanceManager);
    });

    it('launches instance after two players connect', () => {
        matchMaker.queue(() => {});

        expect(created).toBe(false);
        expect(matchMaker.queuedPlayers.length).toEqual(1);

        matchMaker.queue(() => {});

        expect(created).toBe(true);
        expect(matchMaker.queuedPlayers.length).toEqual(0);
    });

    it('removes players from queue on cancel', () => {
        let called = false;
        let cb = () => {
            called = true;
        };

        matchMaker.queue(cb);
        matchMaker.cancel(cb);

        expect(matchMaker.queuedPlayers.length).toEqual(0);
        expect(called).toEqual(false);
    });
});
