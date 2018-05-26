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

    constructor() {
        this.original = ImageProblem.generate();
    }

    getImage() {
        return ImageProblem.genImage(this.original);
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
                    for (let k = 0; k < 4; k++) {
                        image.bitmap.data[4 * (y * h + x) + k] = generator(x / w, y / h);
                    }
                }
            }
            return image;
        }).catch((err) => {
            console.error(err);
        });
    }

    compareImage(player) {
        let orig = this.getImage();
        let play = ImageProblem.genImage(player);
        return Promise.all([orig, play]).then((images) => {
            for (const index of imageIterator(images[0])) {
                if (images[0].bitmap.data[index] != images[1].bitmap.data[index])
                    return false;
            }
            return true;
        });
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