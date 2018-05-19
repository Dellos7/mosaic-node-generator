"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rgb_1 = require("./rgb");
const Jimp = require("jimp");
const mosaic_default_config_json_1 = require("./mosaic-default-config.json");
class JimpImage {
    constructor(image) {
        this.image = image;
    }
    /**
     * Static method
     * Convert the image to Jimp image from path
     * Usage: JimpImage.read( 'input-image.jpg' );
     * @param path
     */
    static read(path) {
        return new Promise((resolve, reject) => {
            Jimp.read(path, function (err, image) {
                if (err instanceof Error) {
                    //If this is the error, do not handle it as the api
                    //already tries to read the file twice
                    if (!err.message.includes('Invalid file signature')) {
                        throw err;
                    }
                }
                if (!image) {
                    reject('Could not read image ' + path);
                }
                else {
                    resolve(image);
                }
            });
        });
    }
    /**
     * Convert the image to Jimp image from path
     * Usage: JimpImage.read( 'input-image.jpg' );
     * @param path
     */
    read(path) {
        return JimpImage.read(path);
    }
    /**
     * Write the image to disk
     * @param imageName
     */
    save(imageName) {
        return new Promise((resolve, reject) => {
            let outputImageName = '';
            if (imageName) {
                outputImageName = imageName + '.jpg';
            }
            else {
                outputImageName = mosaic_default_config_json_1.CONFIG.output_image_name + '_' + new Date().getTime() + '.jpg';
            }
            this.image.write(outputImageName, () => {
                resolve(outputImageName);
            });
        });
    }
    /**
     * Resize the image to the new width and height
     * @param newWidth
     * @param newHeight
     */
    resize(newWidth, newHeight) {
        this.image.resize(newWidth, newHeight);
    }
    /**
     * Paste the given image to the given x and y cords
     * @param image
     * @param x
     * @param y
     */
    composite(image, x, y) {
        if (image instanceof JimpImage) {
            let img = image;
            this.image.composite(img.image, x, y);
        }
        else {
            throw new Error('image is not an instance of JimpImage');
        }
    }
    /**
     * Get the average color of the specified area of the image
     * @param x_start left-top corner x cord of the area
     * @param y_start left-top corner y cord of the area
     * @param width width in pixels of the area
     * @param height height in pixels of the area
     */
    getAverageColor(x_start = 0, y_start = 0, width = this.image.bitmap.width, height = this.image.bitmap.height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let r = 0, g = 0, b = 0;
            let i = 0;
            this.image.scan(x_start, y_start, width, height, function (x, y, idx) {
                r += self.image.bitmap.data[idx + 0];
                g += self.image.bitmap.data[idx + 1];
                b += self.image.bitmap.data[idx + 2];
                i++;
                if (x === (x_start + width) - 1 && y === (y_start + height) - 1) {
                    let red = Math.round(r / i);
                    let green = Math.round(g / i);
                    let blue = Math.round(b / i);
                    resolve(new rgb_1.RGB(red, green, blue));
                }
            });
        });
    }
    /**
     * Get the width in pixels of the image
     */
    getWidth() {
        return this.image.bitmap.width;
    }
    /**
     * Get the height in pixels of the image
     */
    getHeight() {
        return this.image.bitmap.height;
    }
    /**
     * Get the aspect ratio (width/height) of the image
     */
    getAspectRatio() {
        return this.getWidth() / this.getHeight();
    }
}
exports.JimpImage = JimpImage;
