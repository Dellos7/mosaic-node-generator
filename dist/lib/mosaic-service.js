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
const Jimp = require("jimp");
const fs = require("fs");
class RGB {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    getColorDistance(rgb) {
        let diff_r = rgb.r - this.r;
        let diff_g = rgb.g - this.g;
        let diff_b = rgb.b - this.b;
        let distance = Math.sqrt(diff_r * diff_r + diff_g * diff_g + diff_b * diff_b);
        return distance;
    }
}
exports.RGB = RGB;
class MosaicService {
    constructor(image, tiles_dir, final_image_name, cell_width, cell_height, columns, rows) {
        this.default_cell_width = 50;
        this.default_cell_height = 50;
        this.default_columns = 120;
        this.default_rows = 120;
        /*private default_columns: number = 50;
        private default_rows: number = 50;*/
        this.default_final_image_name = 'output';
        this.default_tiles_dir = 'tiles';
        this.image_width = 0;
        this.image_height = 0;
        this.aspect_ratio = 0;
        //Converted tiles into thumbs
        this.tiles = [];
        this.img_tiles_matrix = [];
        this.image = image;
        this.orig_image = this.image.clone();
        this.tiles_dir = tiles_dir ? tiles_dir : this.default_tiles_dir;
        this.final_image_name = final_image_name ? final_image_name : this.default_final_image_name;
        this.cell_width = cell_width ? cell_width : this.default_cell_width;
        this.cell_height = cell_height ? cell_height : this.default_cell_height;
        this.columns = columns ? columns : this.default_columns;
        this.rows = rows ? rows : this.default_rows;
        this.aspect_ratio = this.image.bitmap.width / this.image.bitmap.height;
        this._prepare();
    }
    asyncForEach(arr, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < arr.length; index++) {
                yield cb(arr[index], index, arr);
            }
        });
    }
    asyncFor(n, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            for (let index = 0; index < n; index++) {
                yield cb(index);
            }
        });
    }
    _prepare() {
        let imageWidth = this.image.bitmap.width;
        let imageHeight = this.image.bitmap.height;
        let virtualCols = Math.ceil(imageWidth / this.cell_width);
        let virtualRows = Math.ceil(imageHeight / this.cell_height);
        //If calculated columns are greater than the default ones, we use the calculated sizes
        if (virtualCols > this.columns) {
            this.columns = virtualCols;
            this.rows = virtualRows;
        }
        else {
            //We recalculate columns or rows depending on the aspect ratio
            if (this.aspect_ratio > 1) {
                this.columns = Math.ceil(this.columns * this.aspect_ratio);
            }
            else if (this.aspect_ratio < 1) {
                this.rows = Math.ceil(this.rows * this.aspect_ratio);
            }
        }
        let finalImageWidth = this.cell_width * this.columns;
        let finalImageHeight = this.cell_height * this.rows;
        this.image_width = finalImageWidth;
        this.image_height = finalImageHeight;
        this.image.resize(this.image_width, this.image_height);
    }
    readTiles(tilesDir) {
        return new Promise((resolve, reject) => {
            let _tilesDir = tilesDir ? tilesDir : this.tiles_dir;
            let i = 0;
            let numberOfTiles = fs.readdirSync(_tilesDir).length;
            if (numberOfTiles === 0) {
                reject('There are no tiles in the directory');
            }
            console.log(`${new Date().toString()} - Reading tiles from ${_tilesDir}, ${numberOfTiles} found...`);
            fs.readdirSync(_tilesDir).forEach((tile) => __awaiter(this, void 0, void 0, function* () {
                let jimpImg = yield this.jimpRead(_tilesDir + '/' + tile);
                if (jimpImg) {
                    jimpImg.resize(this.cell_width, this.cell_height);
                    this.tiles.push(jimpImg);
                    //jimpImg.write( 'thumbs/thumb-' + i + '.' + jimpImg.getExtension() );
                    i++;
                    if (i === numberOfTiles - 1) {
                        console.log(`${new Date().toString()} - Finished reading tiles`);
                        resolve(this.tiles);
                    }
                }
            }));
        });
    }
    getBestTileForImage(imageAvgColor, row, col) {
        return new Promise((resolve, reject) => {
            if (!imageAvgColor) {
                throw new Error('No image provided');
            }
            else {
                let tilesDiff = [];
                const _gbtfi = () => __awaiter(this, void 0, void 0, function* () {
                    //Create an array of the tiles and diffs
                    yield this.asyncForEach(this.tiles, (tile, i) => __awaiter(this, void 0, void 0, function* () {
                        let rgb = yield this.getImageAvgColor(tile, 0, 0, this.cell_width, this.cell_height);
                        let diff = imageAvgColor.getColorDistance(rgb);
                        tilesDiff.push({
                            tile_ind: i,
                            diff: diff
                        });
                    }));
                    //Sort the array
                    tilesDiff = tilesDiff.sort((tile1, tile2) => {
                        if (tile1.diff > tile2.diff) {
                            return 1;
                        }
                        if (tile1.diff < tile2.diff) {
                            return -1;
                        }
                        return 0;
                    });
                    //If row does not exist in matrix, create it
                    if (!this.img_tiles_matrix[row]) {
                        this.img_tiles_matrix.push([]);
                    }
                    /**
                     * Code below is what "chooses" what tile is best suitable for the current cell
                     * It prevents using the same tiles too close (in a specified area around the current cell)
                     */
                    let j = -1;
                    let found = false;
                    let IMGAREA = 4;
                    do {
                        found = true;
                        //We check if the tile we are testing exists in an IMGAREA*IMGAREA area around the current cell
                        for (let r = (row - IMGAREA) + 1; r < (row + IMGAREA); r++) {
                            for (let c = (col - IMGAREA) + 1; c < (col + IMGAREA); c++) {
                                if (this.img_tiles_matrix[r] && this.img_tiles_matrix[r][c] && this.img_tiles_matrix[r][c] === tilesDiff[j + 1].tile_ind) {
                                    found = false;
                                    break;
                                }
                            }
                            if (!found) {
                                break;
                            }
                        }
                        j++;
                        //Security code (maybe necessari when using too few tiles)
                        /*if( j === (tilesDiff.length - 1) ) {
                            j = 0;
                            found = true;
                        }*/
                    } while (!found);
                    let bestTile = this.tiles[tilesDiff[j].tile_ind];
                    this.img_tiles_matrix[row][col] = tilesDiff[j].tile_ind;
                    resolve(bestTile);
                });
                _gbtfi();
            }
        });
    }
    generateMosaicImage(tilesDir) {
        return new Promise((resolve, reject) => {
            /**
             * 1. Read tiles --> generate tile thumbs
             * 2. Generate the mosaic image
             */
            this.readTiles(tilesDir).then((tiles) => {
                //this._generateMosaicImage( 0, 0, 1, this.columns );
                this._generateMosaicImage(0, 0, this.rows, this.columns).then(() => {
                    console.log(`${new Date().toString()} - Mosaic image generated.`);
                    this.save();
                    resolve();
                });
            })
                .catch((err) => {
                throw err;
            });
        });
    }
    generateMosaicImage_new(tilesDir) {
        /**
         * 1. Read tiles --> generate tile thumbs
         * 2. Generate the mosaic image. Split image in parts to improve performance
         */
        this.readTiles(tilesDir).then((tiles) => {
            const SPLIT_INTO = 4;
            let nRows = Math.floor(this.rows / (SPLIT_INTO / 2));
            let nCols = Math.floor(this.columns / (SPLIT_INTO / 2));
            let genMosaicSplitPromises = [];
            for (let i = 0; i < (SPLIT_INTO / 2); i++) {
                for (let j = 0; j < (SPLIT_INTO / 2); j++) {
                    console.log(`This will generate a partial mosaic (${i}, ${j})`);
                    let promise = this._generateMosaicImage(i * nRows, j * nCols, nRows, nCols);
                    genMosaicSplitPromises.push(promise);
                    //break; //
                }
                //break; //
            }
            Promise.all(genMosaicSplitPromises).then(() => {
                console.log(`${new Date().toString()} - All promises have finished.`);
                this.save();
            });
        })
            .catch((err) => {
            throw err;
        });
    }
    _generateMosaicImage(rowStart, colStart, numRows, numCols) {
        return new Promise((resolve, reject) => {
            console.log(`${new Date().toString()} - Generating mosaic from (${rowStart}, ${colStart}) 
                        to (${rowStart + numRows}, ${colStart + numCols})`);
            const _process = () => __awaiter(this, void 0, void 0, function* () {
                for (let row = rowStart; row < numRows; row++) {
                    console.log(`- ${new Date().toString()} - Start Row ${row}`);
                    //for( let col = colStart; col < numCols; col++ ) {
                    //TODO: test without async for
                    yield this.asyncFor(numCols, (col) => __awaiter(this, void 0, void 0, function* () {
                        //Get average color of the current cell
                        let imageAvgColor = yield this.getImageAvgColor(this.image, col * this.cell_width, row * this.cell_height, this.cell_width, this.cell_height);
                        //Get the best tile for this average color
                        let bestTile = yield this.getBestTileForImage(imageAvgColor, row, col);
                        //Composite the calculated tile in the final image
                        this.image.composite(bestTile, col * this.cell_width, row * this.cell_height);
                    }));
                    //}
                    console.log(`- ${new Date().toString()} - End Row ${row}`);
                }
                console.log('RESOLVING!');
                resolve();
            });
            _process();
        });
    }
    cropImage(x, y, w, h) {
        let origImageClone = this.orig_image.clone();
        return origImageClone.crop(x, y, w, h);
    }
    save(imageName) {
        console.log(`- ${new Date().toString()} - Saving output image...`);
        let outputImageName = (imageName ? imageName : this.final_image_name)
            + '_'
            + new Date().getTime()
            + '.jpg';
        this.image.write(outputImageName, () => {
            console.log(`- ${new Date().toString()} - END Saving output image!!`);
        });
    }
    jimpRead(path) {
        return new Promise((resolve, reject) => {
            try {
                Jimp.read(path, (err, jimp) => {
                    if (err instanceof Error) {
                        //If this is the error, do not handle it as the api
                        //already tries to read the file twice
                        if (!err.message.includes('Invalid file signature')) {
                            throw err;
                        }
                    }
                    resolve(jimp);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }
    getImageAvgColor(image, x_start, y_start, width, height) {
        return new Promise((resolve, reject) => {
            let r = 0, g = 0, b = 0;
            let i = 0;
            image.scan(x_start, y_start, width, height, function (x, y, idx) {
                r += image.bitmap.data[idx + 0];
                g += image.bitmap.data[idx + 1];
                b += image.bitmap.data[idx + 2];
                i++;
                if (x === (x_start + width) - 1 && y === (y_start + height) - 1) {
                    let red = Math.round(r / i);
                    let green = Math.round(g / i);
                    let blue = Math.round(b / i);
                    resolve(new RGB(red, green, blue));
                }
            });
        });
    }
}
exports.MosaicService = MosaicService;
