import ImageProblem, { Image } from '../../src/problem-engine/ImageProblem';

describe('compareGenerator', () => {
    it('an image should equal itself', (done) => {
        Image.create()
            .then((problem) => {
                return problem.compareGenerator(ImageProblem.generate());
            })
            .then((result) => {
                expect(result).toBe(true);
                done();
            })
            .catch(done.fail);
    });

    it('two different images should not be equal', (done) => {
        Image.create()
            .then((problem) => {
                return problem.compareGenerator(ImageProblem.random);
            })
            .then((result) => {
                expect(result).toBe(false);
                done();
            })
            .catch(done.fail);
    });
});

describe('serialize', () => {
    it('contains the correct fields', (done) => {
        ImageProblem.create()
            .then((problem) => {
                problem
                    .serialize()
                    .then((serialized) => {
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
                    })
                    .catch(done.fail);
            })
            .catch(done.fail);
    });
});

describe('validator', () => {
    it('correctly passes valid return values', () => {
        [0, 100, 255].forEach((val) => {
            let generate = Image.wrapGenerator(() => val);

            expect(generate()).toEqual(val);
        });
    });
});

describe('constructor', () => {
    it('correctly generates the base64 encoding', (done) => {
        Image.create()
            .then((problem) => {
                return new Image(problem.original).compareGenerator(
                    ImageProblem.generate()
                );
            })
            .then((bool) => {
                expect(bool).toBe(true);
                done();
            })
            .catch(done.fail);
    });

    describe('generate a blank image', () => {
        it('equals itself', (done) => {
            let image1 = Image.genBlank();
            let image2 = Image.create((x, y) => {
                return 0;
            })
                .then((image) => {
                    return image.getImage();
                })
                .catch(done.fail);
            return Promise.all([image1, image2])
                .then((images) => {
                    const [image1, image2] = images;

                    expect(Image.compareImages(image1, image2)).toBe(true);
                    done();
                })
                .catch(done.fail);
        });

        it('does not equal a non-blank image', (done) => {
            let image1 = Image.genBlank();
            let image2 = Image.create((x, y) => {
                return 100;
            })
                .then((image) => {
                    return image.getImage();
                })
                .catch(done.fail);
            return Promise.all([image1, image2])
                .then((images) => {
                    const [image1, image2] = images;

                    expect(Image.compareImages(image1, image2)).toBe(false);
                    done();
                })
                .catch(done.fail);
        });
    });

    it('throws error when calling constructor without arg', () => {
        expect(() => {
            new Image();
        }).toThrow(new TypeError('Expected base64 string'));
    });
});

describe('sinGenerator', () => {
    it('creates a sin function', () => {
        let generator = ImageProblem.sinGenerator(2 * Math.PI, 255, 0, true);

        expect(generator(0, 0)).toEqual(0);
        expect(generator(Math.PI / 2, 0)).toEqual(255);
    });
});
