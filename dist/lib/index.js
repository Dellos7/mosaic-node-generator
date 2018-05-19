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
const mosaic_service_1 = require("./mosaic-service");
const Jimp = require("jimp");
/**
* @method: Test method
* @param {string}
* @return {string}
*/
function test(str) {
    return 'You passed in ' + str;
}
exports.test = test;
/**
 * @method: Generates a mosaic image
 * @param {string} origImagePath The original image path
 * @param {string} tilesDirPath The tiles directory path
 */
function mosaic(origImagePath, tilesDirPath) {
    console.log('Generating mosaic image...');
    return null;
}
exports.mosaic = mosaic;
Jimp.read('test/data/profile.jpg', function (err, image) {
    if (err)
        throw err;
    const _genMosaic1 = () => __awaiter(this, void 0, void 0, function* () {
        let mosaicService = new mosaic_service_1.MosaicService(image, 'photos');
        yield mosaicService.generateMosaicImage();
        console.log('DONE GEN MOSAIC 1');
        Jimp.read('test/data/input-image_.jpg', function (err2, image2) {
            if (err2)
                throw err2;
            const _genMosaic2 = () => __awaiter(this, void 0, void 0, function* () {
                mosaicService = new mosaic_service_1.MosaicService(image2, 'photos');
                yield mosaicService.generateMosaicImage();
                console.log('DONE GEN MOSAIC 2');
            });
            _genMosaic2();
        });
    });
    _genMosaic1();
});
/**
 * TODOS:
 * 1. Save thumbs
 * 2. Be able to load thumbs
 * 3. ¿Threading?
 * 4. Pass in memory max to node
 */ 
