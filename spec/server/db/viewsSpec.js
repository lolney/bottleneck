import {
    objects,
    problem,
    checkPassword,
    createUser,
    addSolution,
    getSolutions
} from '../../../src/server/db';
import models from '../../../src/server/db/models';

describe('objects', () => {
    it('returns a list of objects with the correct fields', (done) => {
        objects()
            .then((objs) => {
                expect(objs.length).toBeGreaterThan(0);
                for (const obj of objs) {
                    expect(obj.dbId).toEqual(jasmine.any(String));
                    expect(obj.position.length).toEqual(2);
                    expect(obj.objectType).toEqual('tree');
                }
                done();
            })
            .catch(done.fail);
    });
});

describe('problem', () => {
    it('finds a problem for each object', (done) => {
        objects()
            .then((objs) => {
                let promises = objs.map((obj) => {
                    problem(obj.dbId);
                });
                Promise.all(promises)
                    .then((vals) => {
                        expect(vals.length).toEqual(objs.length);
                        done();
                    })
                    .catch(done.fail);
            })
            .catch(done.fail);
    });

    it('finds a subproblem for each image problem', async () => {
        let objs = await objects();
        let problems = await Promise.all(objs.map((obj) => problem(obj.dbId)));
        for (const problem of problems) {
            if (problem.type == 'image') {
                expect(typeof problem.subproblem.original).toEqual('string');
            }
        }
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
    let user;

    beforeAll(async (done) => {
        user = await models.user.findOne();
        let problems = await models.problem.findAll({ limit: limit });
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

        expect(solvedProblems.length).toEqual(limit);
        expect(solvedProblems[0].problem).toBeDefined();
    });
});
