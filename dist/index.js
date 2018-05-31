#!/usr/bin/env node
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
const mosaic_default_config_json_1 = require("./lib/mosaic-default-config.json");
exports.CONFIG = mosaic_default_config_json_1.CONFIG;
const rgb_1 = require("./lib/rgb");
exports.RGB = rgb_1.RGB;
const jimp_image_1 = require("./lib/jimp-image");
exports.JimpImage = jimp_image_1.JimpImage;
const mosaic_image_1 = require("./lib/mosaic-image");
exports.MosaicImage = mosaic_image_1.MosaicImage;
const utility_1 = require("./lib/utility");
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
        let [err, img] = yield utility_1.catchEm(jimp_image_1.JimpImage.read(inputImagePath));
        if (err) {
            console.error(err);
        }
        else {
            let image = new jimp_image_1.JimpImage(img);
            let mosaicImage = new mosaic_image_1.MosaicImage(image, tilesDirectory, cellWidth, cellHeight, columns, rows, thumbsDirectoryFromRead, thumbsDirectoryToWrite, enableConsoleLogging);
            let [err, _] = yield utility_1.catchEm(mosaicImage.generate());
            if (err) {
                console.error(err);
            }
        }
    });
    _generateMosaic();
}
exports.mosaic = mosaic;
/**
 * Get parameters if we are executing the script directly from CLI
 */
const args = process.argv.slice(2);
const argNames = ['image_path', 'tiles_dir', 'cell_width', 'cell_height',
    'columns', 'rows', 'thumbs_read', 'thumbs_write', 'enable_log'];
let imagePath = 'input.jpg', tilesDir = '', thumbsRead = '', thumbsWrite = '';
let cellWidth = 50, cellHeight = 50, columns = 100, rows = 100;
let enableLog = true;
args.forEach((val, index) => {
    let [argName, argVal] = val.split("=");
    let i = argNames.indexOf(argName);
    if (i >= 0) {
        argNames.splice(i, 1);
        switch (argName) {
            case "image_path":
                imagePath = argVal;
                break;
            case "tiles_dir":
                tilesDir = argVal;
                break;
            case "cell_width":
                cellWidth = Number.parseInt(argVal);
                break;
            case "cell_height":
                cellHeight = Number.parseInt(argVal);
                break;
            case "columns":
                columns = Number.parseInt(argVal);
                break;
            case "rows":
                rows = Number.parseInt(argVal);
                break;
            case "thumbs_read":
                thumbsRead = argVal;
                break;
            case "thumbs_write":
                thumbsWrite = argVal;
                break;
            case "enable_log":
                enableLog = argVal ? true : false;
                break;
        }
    }
});
mosaic(imagePath, tilesDir, cellWidth, cellHeight, columns, rows, thumbsRead, thumbsWrite, enableLog);
