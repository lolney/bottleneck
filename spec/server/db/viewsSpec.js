import { objects } from '../../../src/server/db/views';
import TwoVector from 'lance/serialize/TwoVector';

describe('objects', () => {
    it('returns a list of objects with the correct fields', (done) => {
        objects().then((objs) => {
            expect(objs.length).toBeGreaterThan(0);
            for (const obj of objs) {
                expect(obj.id).toEqual(jasmine.any(String));
                expect(obj.position).toEqual(jasmine.any(TwoVector));
                expect(obj.objectType).toEqual('tree');
            }
            done();
        });
    });
});
