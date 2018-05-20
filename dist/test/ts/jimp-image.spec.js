"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jimp_image_1 = require("./../../lib/jimp-image");
const chai_1 = require("chai");
require("mocha");
const fs = require("fs");
describe('JimpImage', function () {
    let imagePath1 = 'test/data/input-image-1.jpg';
    let imagePath2 = 'test/data/input-image-2.jpg';
    let badImagePath = 'test/data/bad-image-path.jpg';
    it('static read, should correctly read image', () => {
        jimp_image_1.JimpImage.read(imagePath1).then((image) => {
            chai_1.expect(image).not.null;
        });
    });
    it('static read, should not be able to read image', () => {
        jimp_image_1.JimpImage.read(badImagePath).then((image) => {
            chai_1.expect.fail(null, null, 'Should not be able to read image ' + badImagePath);
        }).catch((err) => {
            chai_1.expect(true).to.be.true;
        });
    });
    it('constructor, should correctly create image', () => __awaiter(this, void 0, void 0, function* () {
        let image = new jimp_image_1.JimpImage(yield jimp_image_1.JimpImage.read(imagePath1));
        chai_1.expect(image).not.null;
        chai_1.expect(image.getWidth()).equals(1000);
        chai_1.expect(image.getHeight()).equals(667);
    }));
    it('constructor, should not create image', () => __awaiter(this, void 0, void 0, function* () {
        let image;
        try {
            image = new jimp_image_1.JimpImage(yield jimp_image_1.JimpImage.read(badImagePath));
            chai_1.expect.fail(null, null, 'Should not create image ' + badImagePath);
        }
        catch (err) {
            chai_1.expect(image).to.be.undefined;
        }
    }));
    it('save, should save image in disk', () => __awaiter(this, void 0, void 0, function* () {
        let image = new jimp_image_1.JimpImage(yield jimp_image_1.JimpImage.read(imagePath1));
        yield image.save('image-output');
        fs.readFile('image-output.jpg', null, (err, _) => {
            if (err)
                chai_1.expect.fail(null, null, 'Should read image from disk');
            chai_1.expect(true).to.be.true;
            fs.unlink('image-output.jpg', (err) => {
                if (err)
                    chai_1.expect.fail(null, null, 'Could not remove image from disk');
            });
        });
    }));
    it('resize, should resize image', () => __awaiter(this, void 0, void 0, function* () {
        let image = new jimp_image_1.JimpImage(yield jimp_image_1.JimpImage.read(imagePath1));
        image.resize(500, 300);
        chai_1.expect(image.getWidth()).equals(500);
        chai_1.expect(image.getHeight()).equals(300);
    }));
    it('getAverageColor, should correctly get the average color of the image', () => __awaiter(this, void 0, void 0, function* () {
        let expectAvg_r = 110;
        let expectAvg_g = 141;
        let expectAvg_b = 64;
        let image = new jimp_image_1.JimpImage(yield jimp_image_1.JimpImage.read(imagePath1));
        let rgb = yield image.getAverageColor(0, 0, image.getWidth(), image.getHeight());
        chai_1.expect(rgb.r).equals(expectAvg_r);
        chai_1.expect(rgb.g).equals(expectAvg_g);
        chai_1.expect(rgb.b).equals(expectAvg_b);
    }));
    it('composite, should correctly composite one image into another', () => __awaiter(this, void 0, void 0, function* () {
        let image = new jimp_image_1.JimpImage(yield jimp_image_1.JimpImage.read(imagePath1));
        let imageComp = new jimp_image_1.JimpImage(yield jimp_image_1.JimpImage.read(imagePath2));
        imageComp.resize(100, 100);
        let rgb_imageComp = yield imageComp.getAverageColor(0, 0, imageComp.getWidth(), imageComp.getHeight());
        image.composite(imageComp, 0, 0);
        //We test if the image has successfully been composited if the average RGB of the tile composited
        //and the average RGB of the final image zone where it has been composited match
        let rgb_compImage = yield image.getAverageColor(0, 0, 100, 100);
        chai_1.expect(rgb_compImage.r).equals(rgb_imageComp.r);
        chai_1.expect(rgb_compImage.g).equals(rgb_imageComp.g);
        chai_1.expect(rgb_compImage.b).equals(rgb_imageComp.b);
    }));
    it('getAspectRatio, should correctly get aspect ratio', () => __awaiter(this, void 0, void 0, function* () {
        let image = new jimp_image_1.JimpImage(yield jimp_image_1.JimpImage.read(imagePath1));
        chai_1.expect(image.getAspectRatio()).to.be.closeTo(1.5, 0.1);
    }));
});
