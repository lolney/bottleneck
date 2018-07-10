import ImageProblem from '../../src/problem-engine/ImageProblem';

describe('compareGenerator', () => {
    it('an image should equal itself', (done) => {
        ImageProblem.create()
            .then((problem) => {
                return problem.compareGenerator(ImageProblem.generate());
            })
            .then((result) => {
                expect(result).toBe(true);
                done();
            });
    });

    it('two different images should not be equal', (done) => {
        ImageProblem.create()
            .then((problem) => {
                return problem.compareGenerator(ImageProblem.random);
            })
            .then((result) => {
                expect(result).toBe(false);
                done();
            });
    });
});

describe('serialize', () => {
    it('contains the correct fields', (done) => {
        ImageProblem.create().then((problem) => {
            problem.serialize().then((serialized) => {
                let actualProperties = Object.keys(serialized).sort();
                let expectedProperties = [
                    'title',
                    'description',
                    'code',
                    'type',
                    'original',
                    'target'
                ].sort();
                expect(actualProperties).toEqual(expectedProperties);
                done();
            });
        });
    });
});

describe('validator', () => {
    it('correctly passes valid return values', () => {
        [0, 100, 255].forEach((val) => {
            let generate = ImageProblem.wrapGenerator(() => val);
            expect(generate()).toEqual(val);
        });
    });
});

describe('constructor', () => {
    it('correctly generates the base64 encoding', (done) => {
        ImageProblem.create()
            .then((problem) => {
                return new ImageProblem(problem.original).compareGenerator(
                    ImageProblem.generate()
                );
            })
            .then((bool) => {
                expect(bool).toBe(true);
                done();
            });
    });

    describe('generate a blank image', () => {
        it('equals itself', (done) => {
            let image1 = ImageProblem.genBlank();
            let image2 = ImageProblem.create((x, y) => {
                return 0;
            }).then((image) => {
                return image.getImage();
            });
            return Promise.all([image1, image2]).then((images) => {
                const [image1, image2] = images;
                expect(ImageProblem.compareImages(image1, image2)).toBe(true);
                done();
            });
        });

        it('does not equal a non-blank image', (done) => {
            let image1 = ImageProblem.genBlank();
            let image2 = ImageProblem.create((x, y) => {
                return 100;
            }).then((image) => {
                return image.getImage();
            });
            return Promise.all([image1, image2]).then((images) => {
                const [image1, image2] = images;
                expect(ImageProblem.compareImages(image1, image2)).toBe(false);
                done();
            });
        });
    });

    it('throws error when calling constructor without arg', () => {
        expect(() => {
            new ImageProblem();
        }).toThrow(new TypeError('Expected base64 string'));
    });
});
