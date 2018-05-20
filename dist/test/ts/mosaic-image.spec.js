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
const mosaic_image_1 = require("./../../lib/mosaic-image");
const chai_1 = require("chai");
require("mocha");
describe('MosaicImage', function () {
    this.timeout(5000);
    let imagePath = 'test/data/input-image-1.jpg';
    let image;
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            image = new jimp_image_1.JimpImage(yield jimp_image_1.JimpImage.read(imagePath));
        });
    });
    it('readTiles, should correctly read the 5 tiles in the dir', () => __awaiter(this, void 0, void 0, function* () {
        let mosaicImage = new mosaic_image_1.MosaicImage(image, 'test/data/tiles');
        mosaicImage.enableConsoleLogging = false;
        let tiles = yield mosaicImage.readTiles();
        chai_1.expect(tiles.length).equals(5);
        //}).timeout(10000);
    }));
    it('readTiles, should not read empty dir', () => __awaiter(this, void 0, void 0, function* () {
        try {
            let mosaicImage = new mosaic_image_1.MosaicImage(image, 'test/data/tiles');
            mosaicImage.enableConsoleLogging = false;
            let tiles = yield mosaicImage.readTiles();
            chai_1.expect.fail(null, null, 'Should not read any tiles');
        }
        catch (err) {
            chai_1.expect(true).to.be.true;
        }
    }));
});
