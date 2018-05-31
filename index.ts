#!/usr/bin/env node

import { CONFIG } from './lib/mosaic-default-config.json';
import { RGB } from './lib/rgb';
import { Image } from './lib/image';
import { JimpImage } from './lib/jimp-image';
import { MosaicImage } from './lib/mosaic-image';
import * as Jimp from 'jimp';
import { catchEm } from './lib/utility';

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
export function mosaic(
    inputImagePath: string,
    tilesDirectory?: string,
    cellWidth?: number, 
    cellHeight?: number, 
    columns?: number, 
    rows?: number,
    thumbsDirectoryFromRead?: string,
    thumbsDirectoryToWrite?: string,
    enableConsoleLogging: boolean = true
) {
    const _generateMosaic = async() => {
        
        let [err, img] = await catchEm( JimpImage.read( inputImagePath ) );
        if( err ) {
            console.error(err);
        }
        else {
            let image: Image = new JimpImage( img );
            let mosaicImage = 
                new MosaicImage( image, tilesDirectory, cellWidth, cellHeight, columns, rows, thumbsDirectoryFromRead, thumbsDirectoryToWrite, enableConsoleLogging );
            let [err, _] = await catchEm( mosaicImage.generate() );
            if( err ) {
                console.error(err);
            }
        }
    };
    
    _generateMosaic();
}

export { Image, JimpImage, MosaicImage, RGB, CONFIG };


/**
 * Get parameters if we are executing the script directly from CLI
 */

const args = process.argv.slice(2);
const argNames = 
    [ 'image_path', 'tiles_dir', 'cell_width', 'cell_height', 
        'columns', 'rows', 'thumbs_read', 'thumbs_write', 'enable_log' ];

let imagePath: string = 'input.jpg', tilesDir: string = '', thumbsRead: string = '', thumbsWrite: string = '';
let cellWidth: number = 50, cellHeight: number = 50, columns: number = 100, rows: number = 100;
let enableLog: boolean = true;
args.forEach( (val, index) => {
    let [argName, argVal] = val.split("=");
    let i = argNames.indexOf( argName );
    if( i >= 0 ) {
        argNames.splice(i, 1);
        switch( argName ) {
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

mosaic(
    imagePath,
    tilesDir,
    cellWidth,
    cellHeight,
    columns,
    rows,
    thumbsRead,
    thumbsWrite,
    enableLog
);
