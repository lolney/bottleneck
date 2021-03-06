import ImageProblem, { Image } from '../../src/problem-engine/ImageProblem';

describe('compareGenerator', () => {
    it('an image should equal itself', (done) => {
        Image.create()
            .then((problem) => {
                return problem.compareGenerator(ImageProblem.generate(), 0);
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
                return problem.compareGenerator(ImageProblem.random, 0);
            })
            .then((result) => {
                expect(result).toBe(false);
                done();
            })
            .catch(done.fail);
    });

    it('two approximately equal images should be equal', async () => {
        const image1 = await Image.create(() => 0).then((img) =>
            img.getImage()
        );
        const image2 = await Image.create(() => 1).then((img) =>
            img.getImage()
        );
        const result = Image.compareImages(image1, image2);

        expect(result).toBe(true);
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
                            'target',
                            'id'
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
            let generate = Image.wrapGenerator((x, y) => val);

            expect(generate(1, 2)).toEqual(val);
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

                    expect(Image.compareImages(image1, image2, 0)).toBe(true);
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

                    expect(Image.compareImages(image1, image2, 0)).toBe(false);
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
        let generator = ImageProblem.sinGenerator(2 * Math.PI, 255, 0);

        expect(generator(0, 0)).toEqual(0);
        expect(generator(0, Math.PI / 2)).toEqual(255);
    });
});
