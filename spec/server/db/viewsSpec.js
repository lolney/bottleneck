import {
    objects,
    problem,
    checkPassword,
    createUser
} from '../../../src/server/db/views';

describe('objects', () => {
    it('returns a list of objects with the correct fields', (done) => {
        objects().then((objs) => {
            expect(objs.length).toBeGreaterThan(0);
            for (const obj of objs) {
                expect(obj.dbId).toEqual(jasmine.any(String));
                expect(obj.position.length).toEqual(2);
                expect(obj.objectType).toEqual('tree');
            }
            done();
        });
    });
});

describe('problem', () => {
    it('finds a problem for each object', (done) => {
        objects().then((objs) => {
            let promises = objs.map((obj) => {
                problem(obj.dbId);
            });
            Promise.all(promises).then((vals) => {
                expect(vals.length).toEqual(objs.length);
                done();
            });
        });
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

    it('returns an error with an incorrect username', () => {
        checkPassword('incorrect', 'secret').then((result) => {
            expect(result).toEqual(false);
            done();
        });
    });

    it('returns true with the correct password', (done) => {
        checkPassword('test1', 'secret').then((result) => {
            expect(result).toEqual(true);
            done();
        });
    });

    it('returns false with the incorrect password', (done) => {
        checkPassword('test1', '').then((result) => {
            expect(result).toEqual(false);
            done();
        });
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
