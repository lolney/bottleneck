import ImageProblem from '../../src/problem-engine/ImageProblem';

describe('compareImage', () => {
    it('an image should equal itself', (done) => {
        let problem = new ImageProblem();
        problem.compareImage(problem.original).then((result) => {
            expect(result).toBe(true);
            done();
        });
    });

    it('two different images should not be equal', (done) => {
        let problem = new ImageProblem();
        problem.compareImage(ImageProblem.random).then((result) => {
            expect(result).toBe(false);
            done();
        });
    });
});
