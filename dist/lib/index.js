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
const mosaic_default_config_json_1 = require("./mosaic-default-config.json");
exports.CONFIG = mosaic_default_config_json_1.CONFIG;
const rgb_1 = require("./rgb");
exports.RGB = rgb_1.RGB;
const jimp_image_1 = require("./jimp-image");
exports.JimpImage = jimp_image_1.JimpImage;
const mosaic_image_1 = require("./mosaic-image");
exports.MosaicImage = mosaic_image_1.MosaicImage;
/**
 * Generates a mosaic image
 * @param inputImagePath The path of the input image that will be used to generate the mosaic
 * @param tilesDirectory The tiles directory we will use to read the images we will use in the mosaic generation
 * @param cellWidth The width (in pixels) of each cell in the mosaic
 * @param cellHeight The height (in pixels) of each cell in the mosaic
 * @param columns The number of columns (of tiles) of the mosaic
 * @param rows The number of rows (of tiles) of the mosaic
 * @param thumbsDirectoryFromRead We will use this folder in order to read the already generated thumbs from it
 * @param thumbsDirectoryToWrite We will use this folder in order to write the generated thumbs of the tiles
 * @param enableConsoleLogging Enable console logging
 */
function mosaic(inputImagePath, tilesDirectory, cellWidth, cellHeight, columns, rows, thumbsDirectoryFromRead, thumbsDirectoryToWrite, enableConsoleLogging = true) {
    const _generateMosaic = () => __awaiter(this, void 0, void 0, function* () {
        let image = new jimp_image_1.JimpImage(yield jimp_image_1.JimpImage.read(inputImagePath));
        let mosaicImage = new mosaic_image_1.MosaicImage(image, tilesDirectory, cellWidth, cellHeight, columns, rows, thumbsDirectoryFromRead, thumbsDirectoryToWrite, enableConsoleLogging);
        yield mosaicImage.generate();
    });
    _generateMosaic();
}
exports.mosaic = mosaic;
/**
 * TODOS:
 * 3. ¿Threading?
 * 4. Pass in memory max to node
 */ 
