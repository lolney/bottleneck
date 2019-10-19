import Jimp from 'jimp'; // does not work in browser if not global
import Problem from './Problem';
import Validator, { Type, Range } from './Validator';
import { problemTypes } from '../constants';

function* imageIterator(image) {
    let h = image.bitmap.height;
    let w = image.bitmap.width;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            for (let k = 0; k < 4; k++) {
                yield 4 * (y * h + x) + k;
            }
        }
    }
}

/**
 * Represents metadeta linking the `Image` class to a problem
 */
export default class ImageProblem extends Problem {
    constructor(base64, id, subproblem, name) {
        super(id, subproblem, name);
        this.image = new Image(base64);
    }

    static async create(generator, id, subproblem, name) {
        let gen = generator == null ? ImageProblem.generate() : generator;
        let image = await Image.create(gen);
        return new ImageProblem(image.getBase64(), id, subproblem, name);
    }

    static createProblemFromGenerator(id) {
        let item = ImageProblem.getGenerators()[id];
        return ImageProblem.create(
            item.generator,
            id,
            item.subproblem,
            item.name
        );
    }

    getTitle() {
        return 'Image Matching';
    }

    getDescription() {
        return 'Try to match the target image with the original. Write a function that takes the coordinates x,y, normalized to the range [0,1], and returns the greyscale value at that location (in the range [0, 255]).';
    }

    getStartingCode() {
        return '(x,y) => Math.round(255 * Math.sin(1));';
    }

    getTypeString() {
        return problemTypes.IMAGE;
    }

    serialize() {
        return Image.genBlank()
            .then((blank) => {
                return Image.fromImage(blank);
            })
            .then((image) => {
                return {
                    ...super.serialize(),
                    original: this.image.original,
                    target: image.original
                };
            });
    }

    static generate() {
        return (x, y) => {
            return Math.round(255 * x);
        };
    }

    static getGenerators() {
        return [
            {
                generator: (x, y) => Math.round(255 * x),
                name: 'increasing x',
                subproblem: 'gradient'
            },
            {
                generator: (x, y) => Math.round(255 * y),
                name: 'increasing y',
                subproblem: 'gradient'
            }
        ].concat(ImageProblem.makeSinGenerators());
    }

    static makeSinGenerators() {
        let periods = [1 / 8, 1 / 4, 1 / 2];
        let amplitudes = [100, 255, 128];
        let zeros = [0, 128];

        function* gen() {
            for (const period of periods) {
                for (const amplitude of amplitudes) {
                    for (const zero of zeros) {
                        for (const independentX of [true, false]) {
                            yield {
                                generator: ImageProblem.sinGenerator(
                                    period,
                                    amplitude,
                                    zero,
                                    independentX
                                ),
                                name: `period ${period}, amplitude ${amplitude}, zero ${zero}, ${
                                    independentX ? 'x' : 'y'
                                }`,
                                subproblem: 'sin'
                            };
                        }
                    }
                }
            }
        }

        return [...gen()];
    }

    static sinGenerator(period, amplitude, zero, independentX = true) {
        let factor = (2 * Math.PI) / period;
        let clamp = (x) => {
            if (x < 0) return 0;
            if (x > 255) return 255;
            return x;
        };
        let fn = (x) =>
            Math.round(clamp(amplitude * Math.sin(x * factor) + zero));

        if (independentX) return (x, y) => fn(x);
        else return (x, y) => fn(y);
    }

    static random(x, y) {
        return Math.round(Math.random() * 255);
    }
}

export class Image {
    constructor(base64) {
        if (base64 == null) throw new TypeError('Expected base64 string');
        this.original = base64;
    }

    static create(generator) {
        let gen = generator == null ? ImageProblem.generate() : generator;
        return Image.genImage(gen).then((image) => {
            return Image.fromImage(image);
        });
    }

    static fromImage(image) {
        return new Promise((resolve, reject) => {
            image.getBase64(Jimp.MIME_BMP, (err, base64) => {
                if (err) reject(err);
                resolve(new Image(base64));
            });
        });
    }

    getImage() {
        let s = this.original.slice(22);
        return Jimp.read(Buffer.from(s, 'base64'));
    }

    getBase64(cb) {
        return this.original;
    }

    static genBlank() {
        return new Promise((resolve, reject) => {
            new Jimp(100, 100, 255, (err, image) => {
                if (err) reject(err);
                resolve(image);
            });
        });
    }

    static genImage(generator) {
        return Image.genBlank().then((image) => {
            let h = image.bitmap.height;
            let w = image.bitmap.width;
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    for (var k = 0; k < 3; k++) {
                        image.bitmap.data[4 * (y * h + x) + k] = generator(
                            x / w,
                            y / h
                        );
                    }
                    // May need to set alpha channel
                    image.bitmap.data[4 * (y * h + x) + k] = 255;
                }
            }
            return image;
        });
    }

    compareGenerator(generator, threshold = 0.1) {
        let orig = this.getImage();
        let play = Image.genImage(generator);
        return Promise.all([orig, play]).then((images) => {
            return Image.compareImages(images[0], images[1], threshold);
        });
    }

    async compareImage(problem, threshold) {
        const [image1, image2] = await Promise.all(
            [this, problem].map((a) => a.getImage())
        );
        return Image.compareImages(image1, image2, threshold);
    }

    // threshold of 0 means the images need to be identical
    static compareImages(image1, image2, threshold = 0.2) {
        const diff = Jimp.diff(image1, image2, threshold);
        const distance = Jimp.distance(image1, image2);
        return diff.percent <= threshold && distance <= threshold;
    }

    static wrapGenerator(generator) {
        if (!(generator instanceof Function)) {
            throw new Error('You need to provide a function');
        }
        return (...args) => {
            let returnValidator = new Validator(
                [Type.is('number'), Type.isInteger(), Range.in(0, 255)],
                2
            );
            return returnValidator.callGeneratorWithValidator(generator, args);
        };
    }
}
