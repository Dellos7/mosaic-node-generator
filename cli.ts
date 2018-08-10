#!/usr/bin/env node

import { mosaic } from './index';
import * as commander from 'commander';

let checkArguments = (
    inputImage: string,
    tilesDirectory: string,
    thumbsReadDirectory: string,
    thumbsWriteDirectory: string,
    cellWidth: number,
    cellHeight: number,
    rows: number,
    columns: number
) => {
    if( !inputImage ) {
        console.log('Error: option -i, --input-image <image_path> missing');
        process.exit();
    }
    if( !tilesDirectory && !thumbsReadDirectory ) {
        console.log('Error: you need to specify either -d, --tiles-directory or -tr, --thumbs-read');
        process.exit();
    }
};

/**
 * Get parameters if we are executing the script directly from CLI
 */

commander
 .version('1.1.5')
 .option('-i, --input-image [input_image]', 'The input image path')
 .option('-d, --tiles-directory [tiles_directory]', 'The tiles directory path')
 .option('-R, --thumbs-read [thumbs_read_directory]', 'The thumbnails read directory')
 .option('-W, --thumbs-write [thumbs_write_directory]', 'The thumbnails write directory')
 .option('-r, --rows [rows]', 'The number of rows of the output image')
 .option('-c, --columns [columns]', 'The number of columns of the output image')
 .option('-w, --cell-width [width]', 'The cell width of each cell of the output image')
 .option('-h, --cell-height [height]', 'The cell height of each cell of the output image')
 .option('-l, --disable-log [true/false]', 'Disable console logging')
 .parse(process.argv);

 let inputImage: string = commander.inputImage;
 let tilesDirectory: string = commander.tilesDirectory;
 let thumbsReadDirectory: string = commander.thumbsRead;
 let thumbsWriteDirectory: string = commander.thumbsWrite;
 let cellWidth: number = Number.parseInt(commander.cellWidth);
 let cellHeight: number = Number.parseInt(commander.cellHeight);
 let columns: number = Number.parseInt(commander.columns);
 let rows: number = Number.parseInt(commander.rows);
 let enableLog: boolean = commander.disableLog ? false : true;

 checkArguments(
    inputImage,
    tilesDirectory,
    thumbsReadDirectory,
    thumbsWriteDirectory,
    cellWidth,
    cellHeight,
    columns,
    rows
 );

mosaic(
    inputImage,
    tilesDirectory,
    cellWidth,
    cellHeight,
    columns,
    rows,
    thumbsReadDirectory,
    thumbsWriteDirectory,
    enableLog
);