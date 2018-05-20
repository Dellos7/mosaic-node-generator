"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jimp_image_1 = require("./../../lib/jimp-image");
const chai_1 = require("chai");
require("mocha");
describe('JimpImage', function () {
    let imagePath = 'test/data/input-image.jpg';
    it('static read, should correctly read image', () => {
        jimp_image_1.JimpImage.read(imagePath).then((image) => {
            chai_1.expect(image).not.null;
        });
    });
});
