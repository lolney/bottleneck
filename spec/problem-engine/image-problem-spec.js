import ImageProblem from '../../problem-engine/ImageProblem';

describe('compareImage', function () {
    it('an image should equal itself', function () {
        let problem = new ImageProblem();
        expect(problem.compareImage(problem.original), true);
    });
});
