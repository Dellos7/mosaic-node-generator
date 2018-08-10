[![Build Status](https://travis-ci.org/Dellos7/mosaic-node-generator.svg?branch=master)](https://travis-ci.org/Dellos7/mosaic-node-generator) [![npm version](https://badge.fury.io/js/mosaic-node-generator.svg)](https://badge.fury.io/js/mosaic-node-generator)

# mosaic-node-generator
A Node module to generate mosaic images.

[<img src="https://github.com/Dellos7/mosaic-node-generator-example/raw/master/input.jpg" width="300" align="left" />](https://github.com/Dellos7/mosaic-node-generator-example/raw/master/input.jpg)

[<img src="https://github.com/Dellos7/mosaic-node-generator-example/blob/master/outputs/output_rc-100_30x30.jpg" width="300" />](https://github.com/Dellos7/mosaic-node-generator-example/blob/master/outputs/output_rc-100_30x30.jpg)

## Installation

You must have [Node.js](https://nodejs.org/es/) installed in your system.

Using **npm**:
```sh
npm install mosaic-node-generator --save
```

## Example

Example: [mosaic-node-generator-example](https://github.com/Dellos7/mosaic-node-generator-example)

## Code usage

### Javascript

**Easy example**. Create a mosaic image from picture `picture.jpg` using the tiles from the folder `pictures_folder`.

```javascript
var mosaic = require('mosaic-node-generator');
mosaic.mosaic( 
  'picture.jpg', 
  'pictures_folder' 
);
```

```javascript
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
function mosaic( 
  inputImagePath: string, 
  tilesDirectory?: string, 
  cellWidth?: number, 
  cellHeight?: number, 
  columns?: number, 
  rows?: number, 
  thumbsDirectoryFromRead?: string, thumbsDirectoryToWrite?: string, 
  enableConsoleLogging?: boolean
): void;
```

### TypeScript

> TODO

```typescript
```

## CLI usage

### Install

Install npm package as global:

```sh
npm install mosaic-node-generator -g
```

### Usage

```sh
mosaic-node-generator --help
```
```
Options:

-V, --version                                output the version number
    -i, --input-image [input_image]              The input image path
    -d, --tiles-directory [tiles_directory]      The tiles directory path
    -R, --thumbs-read [thumbs_read_directory]    The thumbnails read directory
    -W, --thumbs-write [thumbs_write_directory]  The thumbnails write directory
    -r, --rows [rows]                            The number of rows of the output image
    -c, --columns [columns]                      The number of columns of the output image
    -w, --cell-width [width]                     The cell width of each cell of the output image
    -h, --cell-height [height]                   The cell height of each cell of the output image
    -l, --disable-log [true/false]               Disable console logging
    -h, --help                                   output usage information
```

### Usage example
Basic example. Create mosaic from input image and pictures folder. Write the generated thumbs from the pictures so next time we can just read the thumbs and not the pictures again:

```sh
mosaic-node-generator -i photo.jpg -d pictures_folder -W thumbs
```

Then we generate the mosaic again but this time reading from the thumbs generated from the last execution:

```sh
mosaic-node-generator -i photo.jpg  -R thumbs
```
> We must take into account that if we have written the thumbnails using e.g `cell_width` and `cell_height` of 50x50 and then we generate again the mosaic reading from these thumbs, we should use a `cell_width` and `cell_height` of 50x50 again.

## Test 

Run Typescript tests:
```sh
npm run test:ts
```
