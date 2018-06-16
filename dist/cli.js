#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
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
index_1.mosaic(imagePath, tilesDir, cellWidth, cellHeight, columns, rows, thumbsRead, thumbsWrite, enableLog);
