"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mosaic_service_1 = require("./../../lib/mosaic-service");
const chai_1 = require("chai");
require("mocha");
const Jimp = require("jimp");
describe('MosaicService', function () {
    this.timeout(5000);
    let image;
    let imageCopy;
    beforeEach(function (done) {
        Jimp.read('test/input-image.jpg', function (err, jimpImage) {
            if (err)
                throw err;
            image = jimpImage;
            imageCopy = image.clone();
            done();
        });
    });
    it('constructor, should correctly prepare the image, use default config', () => {
        let mosaicService = new mosaic_service_1.MosaicService(imageCopy);
        chai_1.expect(mosaicService.cell_width).equals(50, 'Assert default cell width');
        chai_1.expect(mosaicService.cell_height).equals(50, 'Assert default cell width');
        chai_1.expect(mosaicService.aspect_ratio).greaterThan(1, 'Assert aspect ratio');
        chai_1.expect(mosaicService.rows).equals(120, 'Assert rows');
        //As aspect ratio is > 1, we will have more columns than the default
        chai_1.expect(mosaicService.columns).greaterThan(120, 'Assert columns');
        //We assert that the final image is greater than the original
        chai_1.expect(mosaicService.image.bitmap.width).greaterThan(image.bitmap.width);
        chai_1.expect(mosaicService.image.bitmap.height).greaterThan(image.bitmap.height);
        chai_1.expect(mosaicService.image.bitmap.width).equals(mosaicService.image_width);
        chai_1.expect(mosaicService.image.bitmap.height).equals(mosaicService.image_height);
    });
    //Add more tests
});
