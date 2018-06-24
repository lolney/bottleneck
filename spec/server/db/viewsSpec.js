import { objects, problem } from '../../../src/server/db/views';
import TwoVector from 'lance/serialize/TwoVector';

describe('objects', () => {
    it('returns a list of objects with the correct fields', (done) => {
        objects().then((objs) => {
            expect(objs.length).toBeGreaterThan(0);
            for (const obj of objs) {
                expect(obj.dbId).toEqual(jasmine.any(String));
                expect(obj.position).toEqual(jasmine.any(TwoVector));
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
