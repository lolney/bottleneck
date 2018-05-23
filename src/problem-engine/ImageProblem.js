const Jimp = require("jimp");

export default class ImageProblem {

    constructor() {
        this.original = ImageProblem.generate();
    }

    getImage() {
        return ImageProblem.genImage(this.original);
    }

    static genImage(generator) {
        return Jimp.read("blank.bmp").then(function (image) {

            let h = image.bitmap.height;
            let w = image.bitmap.width;
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    for (let k = 0; k < 4; k++) {
                        image.bitmap.data[4 * (y * h + x) + k] = generator(x / w, y / h);
                    }
                }
            }
            image.write("test.bmp");
            return image;
        }).catch((err) => {
            console.error(err);
        });
    }

    async compareImage(player) {
        let orig = this.getImage();
        let play = ImageProblem.genImage(player);
        return await Promise.all([orig, play]).then(function (images) {
            // see Jimp.diff
            return images[0] == images[1];
        });
    }

    static generate() {
        return function (x, y) {
            return Math.round(255 * x);
        }
    }

    static random(x, y) {
        return Math.round(Math.random() * 255);
    }

}