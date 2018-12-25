import { chainIncludes } from '../../../src/server/db';
import {
    objects,
    problem,
    getObjectResources,
    markAsCollected
} from '../../../src/server/db/views/gameObject';
import {
    addToResourceCount,
    decrementHP,
    createPlayer,
    getPlayer
} from '../../../src/server/db/views/player';
import {
    createUser,
    getUserId,
    createGuest
} from '../../../src/server/db/views/user';
import {
    addSolution,
    getSolutions,
    solvedProblem
} from '../../../src/server/db/views/solvedProblem';
import { createGame, destroyGame } from '../../../src/server/db/views/game';

import models from '../../../src/server/db/models';
import TwoVector from 'lance/serialize/TwoVector';
import { assaultBot, playerBase } from '../../../src/config';

let userCount = 0;

async function createUniqueUser() {
    userCount++;
    return createUser(`test${userCount}`);
}

describe('chainIncludes', () => {
    it('returns the correct answer for a single include', () => {
        expect(chainIncludes(1)).toEqual([1]);
    });

    it('returns the correct answer for multiple nested includes', () => {
        expect(chainIncludes(1, 2, 3)).toEqual([
            {
                model: 1,
                include: [{ model: 2, include: [3] }]
            }
        ]);
    });
});

describe('objects', () => {
    it('returns a list of objects with the correct fields', (done) => {
        objects()
            .then((objs) => {
                expect(objs.length).toBeGreaterThan(0);
                for (const obj of objs) {
                    expect(obj.dbId).toEqual(jasmine.any(String));
                    expect(obj.position.length).toEqual(2);
                    expect(obj.objectType).toEqual('tree');
                    expect(obj.behaviorType).toEqual('resource');
                    expect(obj.problemId).toEqual(jasmine.any(String));
                    expect(obj.solvedBy).toBeDefined();
                }
                done();
            })
            .catch(done.fail);
    });

    it('can be marked as collected', async () => {
        let objs = await objects();

        expect(objs.length).toBeGreaterThan(0);
        const id = objs[0].dbId;

        await markAsCollected(id);
        let obj = await models.gameObject.findOne({
            where: { id: id }
        });

        expect(obj.collected).toEqual(true);

        // revert
        await obj.update({ collected: objs[0].collected });
    });
});

describe('problem', () => {
    let objs;

    beforeAll(async () => {
        objs = await objects();
    });

    it('finds a problem for each object', async () => {
        let problems = await Promise.all(objs.map((obj) => problem(obj.dbId)));

        expect(problems.length).toEqual(objs.length);
    });

    it('finds a subproblem for each image problem', async () => {
        let problems = await Promise.all(objs.map((obj) => problem(obj.dbId)));
        for (const prob of problems) {
            let problem = prob.problem;
            if (problem.type == 'image') {
                expect(typeof problem.subproblem.original).toEqual('string');
            }
        }
    });

    it('marks unsolved problems as unsolved', async () => {
        let problems = await Promise.all(objs.map((obj) => problem(obj.dbId)));
        for (const prob of problems) {
            if (prob.problem.type == 'image') {
                expect(prob.isSolved).toBe(false);
            }
        }
    });

    it('marks solved problems as solved', async () => {
        let user = await models.user.findOne();
        let obj = await models.gameObject.findOne();
        let prob = await problem(obj.id);
        const code = '() => 1;';

        let solution = await addSolution(user.id, prob.problem.id, code);

        prob = await problem(obj.id, user.id);

        expect(prob.isSolved).toBe(true);
        expect(prob.code).toBeDefined();
        await solution.destroy();
    });
});

describe('createUser', () => {
    let user;
    let newUser;

    beforeAll((done) => {
        createUser('taken').then((u) => {
            user = u;
            done();
        });
    });

    afterAll(async () => {
        await Promise.all([newUser, user].map((u) => u.destroy()));
    });

    it('returns error if username already exists', (done) => {
        createUser('taken')
            .then(() => {
                done(new Error('should not succeed'));
            })
            .catch((e) => {
                expect(e.errors[0].message).toEqual('username must be unique');
                done();
            });
    });

    it('creates user if user does not exist', async () => {
        let id = await getUserId('not-taken');

        newUser = await models.user.find({ where: { id } });

        expect(id).toBeDefined();
        expect(newUser.id).toEqual(id);
    });
});

describe('createGuest', () => {
    let user;

    afterAll(async () => {
        await user.destroy();
    });

    it('creates guest user properly', async () => {
        user = await createGuest();

        expect(user.username).toBeDefined();
        expect(user.isGuest).toBe(true);
    });
});

describe('addSolution', () => {
    let solutions = [];
    const code = '() => \'test\'';
    const limit = 2;
    let base;
    let user;

    beforeAll(async (done) => {
        user = await models.user.findOne();
        let problems = await models.problem.findAll({ limit: limit });

        let solvedProblems = await getSolutions(user.id);
        base = solvedProblems.length;

        for (const problem of problems) {
            await addSolution(user.id, problem.id, code).then((s) => {
                solutions.push(s);
            });
        }
        done();
    });

    afterAll((done) => {
        solutions.forEach((solution) =>
            solution.destroy().then(() => {
                done();
            })
        );
    });

    it('can be found by solvedProblem', async () => {
        for (const solution of solutions) {
            const other = await solvedProblem(solution.id);

            expect(other.code).toEqual(solution.code);
            expect(other.problemId).toEqual(solution.problemId);
        }
    });

    it('correctly adds the code', () => {
        for (const solution of solutions) {
            expect(solution.code).toEqual(code);
        }
    });

    it('correctly associates with the problem', async () => {
        let solvedProblems = await getSolutions(user.id);

        expect(solvedProblems.length).toEqual(base + limit);
        for (const solved of solvedProblems) {
            expect(solved.problem).toBeDefined();
            expect(solved.problem.name).toBeDefined();
            expect(solved.problem.type).toBeDefined();
            if (solved.problem.type == 'image') {
                expect(solved.problem.subproblem).toBeDefined();
                expect(solved.problem.subproblem.type).toBeDefined();
            } else {
                expect(solved.problem.name).toEqual('Inorder traversal');
                expect(solved.problem.subproblem).not.toBeDefined();
            }
        }
    });
});

describe('getPlayer', () => {
    let user;
    let player;
    let game;

    beforeAll(async () => {
        game = await createGame();
        user = await createUniqueUser();

        expect(user.playerId).toBe(null);

        player = await createPlayer(user.id, 1, game.id, new TwoVector(0, 0));
    });

    afterAll(async () => {
        await player.destroy();
        await user.destroy();
        await game.destroy();
    });

    it('correctly sets the user id', async () => {
        expect(player.userId).toEqual(user.id);
    });

    it('correctly creates the base', async () => {
        let base = await player.getBase();

        expect(base.hp).toEqual(playerBase.baseHP);
    });

    it('if existing user id provided, returns existing player', async () => {
        let otherPlayer = await getPlayer(user.id, 1, game.id);

        expect(otherPlayer.id).toEqual(player.id);
    });
});

describe('addToResourceCount', () => {
    let user;
    let player;
    let game;

    beforeAll(async () => {
        game = await createGame();
        user = await createUniqueUser();
        player = await createPlayer(user.id, 0, game.id, new TwoVector(0, 0));
    });

    afterAll(async () => {
        await player.destroy();
        await user.destroy();
        await game.destroy();
    });

    it('correctly adds resource count to newly-initialized player', async () => {
        let gameObjects = await objects(); // get a random gameObject
        let resources = gameObjects[0].resources;
        let counts = resources.map((o) => o.count); // find resource count of

        let newCount0 = await addToResourceCount(
            player.id,
            resources[0].name,
            10
        );
        let newCount1 = await addToResourceCount(
            player.id,
            resources[1].name,
            15
        );

        expect(newCount0).toEqual(10 + counts[0]);
        expect(newCount1).toEqual(15 + counts[1]);
    });

    it('decrementHP correctly updates db', async () => {
        let hp = await decrementHP(player.id);

        expect(hp).toEqual(playerBase.baseHP - assaultBot.damage);

        let base = await player.getBase();

        expect(base.hp).toEqual(hp);

        while (hp > 0) {
            hp = await decrementHP(player.id);
        }

        expect(hp).toEqual(0);
    });
});

describe('getObjectResources', () => {
    it('returns a list of resources', async () => {
        let gameObjects = await objects(); // get a random gameObject
        let obj = gameObjects[0];

        let resources = await getObjectResources(obj.dbId);

        expect(resources.length).toEqual(2);
        expect(resources[0].count).not.toBe(null);
    });
});

describe('game', () => {
    let game;
    let user;
    let player;

    beforeEach(async () => {
        game = await createGame();
    });

    afterEach(async () => {
        user.destroy();
        player.destroy();
        game.destroy();
    });

    it('destroy also destroys players', async () => {
        user = await createUniqueUser();
        player = await createPlayer(user.id, 1, game.id);

        expect(player).toBeDefined();

        await destroyGame(game.id);

        let after = await models.player.find({ where: { id: player.id } });

        expect(after).toBe(null);
    });

    it('destroy also destroys test users', async () => {
        user = await createGuest();
        player = await createPlayer(user.id, 1, game.id);

        expect(user).toBeDefined();

        await destroyGame(game.id);

        let after = await models.user.find({ where: { id: user.id } });

        expect(after).toBe(null);
    });

    it('destroy does not destroy normal users', async () => {
        user = await createUniqueUser();
        player = await createPlayer(user.id, 1, game.id);

        await destroyGame(game.id);

        let after = await models.user.find({ where: { id: user.id } });

        expect(after).toBeDefined();
    });
});
