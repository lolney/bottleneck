import {
    objects,
    problem,
    checkPassword,
    createUser,
    addSolution,
    getSolutions,
    chainIncludes,
    setPlayerId,
    getUserId,
    addToResourceCount,
    getObjectResources
} from '../../../src/server/db';
import models from '../../../src/server/db/models';
import TwoVector from 'lance/serialize/TwoVector';

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

describe('checkPassword', () => {
    let user;

    beforeAll((done) => {
        createUser('test1', 'secret', 'test1@example.com').then((u) => {
            user = u;
            done();
        });
    });

    afterAll((done) => {
        user.destroy().then(() => {
            done();
        });
    });

    it('returns false with an incorrect username', (done) => {
        checkPassword('incorrect', 'secret')
            .then((result) => {
                expect(result).toEqual(false);
                done();
            })
            .catch(done.fail);
    });

    it('returns true with the correct password', (done) => {
        checkPassword('test1', 'secret')
            .then((result) => {
                expect(result).toEqual(true);
                done();
            })
            .catch(done.fail);
    });

    it('returns false with the incorrect password', (done) => {
        checkPassword('test1', '')
            .then((result) => {
                expect(result).toEqual(false);
                done();
            })
            .catch(done.fail);
    });
});

describe('createUser', () => {
    let user;

    beforeAll((done) => {
        createUser('test2', 'secret', 'test2@example.com').then((u) => {
            user = u;
            done();
        });
    });

    afterAll((done) => {
        user.destroy().then(() => {
            done();
        });
    });

    it('returns error if username already exists', (done) => {
        createUser('test2', 'secret', 'unique@example.com')
            .then(() => {
                done(new Error('should not succeed'));
            })
            .catch((e) => {
                expect(e.errors[0].message).toEqual('username must be unique');
                done();
            });
    });

    it('returns error if email already exists', (done) => {
        createUser('unique', 'secret', 'test2@example.com')
            .then(() => {
                done(new Error('should not succeed'));
            })
            .catch((e) => {
                expect(e.errors[0].message).toEqual('email must be unique');
                done();
            });
    });

    it('returns error if email is invalid', (done) => {
        createUser('unique', 'secret', 'unique')
            .then(() => {
                done(new Error('should not succeed'));
            })
            .catch((e) => {
                expect(e.errors[0].message).toEqual('Must be a valid email.');
                done();
            });
    });

    it('create user hashes password', () => {
        expect(user.password).not.toEqual('secret');
        expect(user.validPassword('secret')).toEqual(true);
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

describe('setPlayerId', () => {
    it('correctly sets the user id', async () => {
        let user = await models.user.findOne();

        expect(user.playerId).toEqual(null);

        let player = await setPlayerId(user.id, 1);
        user = await models.user.findOne({ where: { id: user.id } });

        expect(player.playerNumber).toEqual(1);
        await setPlayerId(user.id, null);
    });
});

describe('addToResourceCount', () => {
    let user;
    let player;

    beforeAll(async () => {
        user = await createUser('test2', 'test2', 'test2@test.com');
        player = await setPlayerId(user.id, 0, new TwoVector(0, 0));
    });

    afterAll(async () => {
        let resources = await player.getResources();
        await resources.map((res) => res.destroy());
        await player.destroy();
        await user.destroy();
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
