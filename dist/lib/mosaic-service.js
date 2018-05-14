"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Jimp = require("jimp");
const fs = require("fs");
class MosaicService {
    constructor(image, tiles_dir, final_image_name, cell_width, cell_height, columns, rows) {
        this.default_cell_width = 50;
        this.default_cell_height = 50;
        this.default_columns = 120;
        this.default_rows = 120;
        this.default_final_image_name = 'output';
        this.default_tiles_dir = 'tiles';
        this.image_width = 0;
        this.image_height = 0;
        this.aspect_ratio = 0;
        //Converted tiles into thumbs
        this.tiles = [];
        this.image = image;
        this.tiles_dir = tiles_dir ? tiles_dir : this.default_tiles_dir;
        this.final_image_name = final_image_name ? final_image_name : this.default_final_image_name;
        this.cell_width = cell_width ? cell_width : this.default_cell_width;
        this.cell_height = cell_height ? cell_height : this.default_cell_height;
        this.columns = columns ? columns : this.default_columns;
        this.rows = rows ? rows : this.default_rows;
        this.aspect_ratio = this.image.bitmap.width / this.image.bitmap.height;
        this._prepare();
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
            fs.readdirSync(_tilesDir).forEach((tile) => {
                Jimp.read(tile, (err, jimpImg) => {
                    if (err)
                        throw err;
                    jimpImg.resize(this.cell_width, this.cell_height);
                    this.tiles.push(jimpImg);
                    jimpImg.write('thumbs/thumb-' + i + '.' + jimpImg.getExtension());
                    i++;
                    if (i === numberOfTiles) {
                        resolve(this.tiles);
                    }
                });
            });
        });
    }
    save(imageName) {
        let outputImageName = (imageName ? imageName : this.final_image_name)
            + '_'
            + new Date().getTime()
            + '.jpg';
        this.image.write(outputImageName);
    }
}
exports.MosaicService = MosaicService;
