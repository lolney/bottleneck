const Jimp = require('jimp');

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

export default class ImageProblem {

    constructor(base64) {
        if (base64 == null)
            throw new TypeError('Expected base64 string');
        this.original = base64;
    }

    static create(generator) {
        let gen = generator == null ? ImageProblem.generate() : generator;
        return ImageProblem.genImage(gen)
            .then((image) => {
                return new Promise((resolve, reject) => {
                    image.getBase64(Jimp.MIME_BMP, (err, base64) => {
                        if (err)
                            reject(err);
                        resolve(new ImageProblem(base64));
                    });
                }
                );
            });
    }

    getImage() {
        return Jimp.read(Buffer.from(this.original.slice(22), 'base64'));
    }

    getBase64(cb) {
        return this.original;
    }

    getTitle() {
        return 'Title';
    }

    getDescription() {
        return 'This is the description';
    }

    static genImage(generator) {
        return Jimp.read('blank.bmp').then((image) => {

            let h = image.bitmap.height;
            let w = image.bitmap.width;
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    for (let k = 0; k < 3; k++) {
                        image.bitmap.data[4 * (y * h + x) + k] = generator(x / w, y / h);
                    }
                }
            }
            return image;
        }).catch((err) => {
            console.error(err);
        });
    }

    compareImage(generator) {
        let orig = this.getImage();
        let play = ImageProblem.genImage(generator);
        return Promise.all([orig, play]).then((images) => {
            return ImageProblem.compareImages(images[0], images[1]);
        });
    }

    static compareImages(image1, image2) {
        for (const index of imageIterator(image1)) {
            if (image1.bitmap.data[index] != image2.bitmap.data[index])
                return false;
        }
        return true;
    }

    static generate() {
        return (x, y) => {
            return Math.round(255 * x);
        };
    }

    static random(x, y) {
        return Math.round(Math.random() * 255);
    }

}