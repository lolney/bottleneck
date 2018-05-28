import ImageProblem from '../../src/problem-engine/ImageProblem';

describe('compareImage', () => {
    it('an image should equal itself', (done) => {
        ImageProblem.create().then((problem) => {
            return problem.compareImage(ImageProblem.generate());
        }).then((result) => {
            expect(result).toBe(true);
            done();
        });
    });

    it('two different images should not be equal', (done) => {
        ImageProblem.create().then((problem) => {
            return problem.compareImage(ImageProblem.random);
        }).then((result) => {
            expect(result).toBe(false);
            done();
        });
    });
});

describe('constructor', () => {
    it('correctly generate the base64 encoding', (done) => {
        ImageProblem.create().then((problem) => {
            return new ImageProblem(problem.original)
                .compareImage(ImageProblem.generate());
        }).then((bool) => {
            expect(bool).toBe(true);
            done();
        });
    });

    it('generate a blank image', (done) => {
        let image1 = ImageProblem.genBlank();
        let image2 = ImageProblem.create(() => { return 0 })
            .then((image) => {
                return image.getImage();
            });
        return Promise.all([image1, image2]).then((images) => {
            const [image1, image2] = images;
            expect(ImageProblem.compareImages(image1, image2)).toBe(true);
            done();
        });
    });

    it('throws error when calling constructor without arg', () => {
        expect(() => { new ImageProblem() }).toThrow(new TypeError("Expected base64 string"));
    });
});
