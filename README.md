[![Build Status](https://travis-ci.org/Dellos7/mosaic-node-generator.svg?branch=master)](https://travis-ci.org/Dellos7/mosaic-node-generator) [![npm version](https://badge.fury.io/js/mosaic-node-generator.svg)](https://badge.fury.io/js/mosaic-node-generator)

# mosaic-node-generator
A Node module to generate mosaic images.

## Installation 
```sh
npm install mosaic-node-generator --save
yarn add mosaic-node-generator
bower install mosaic-node-generator --save
```
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

Install npm package as global:

```sh
npm install mosaic-node-generator -g
```

Use the CLI tool:
```sh
mosaic-node-generator image_path=photo.jpg tiles_dir=pictures_folder
```

Available CLI arguments:

* **image_path**: The path of the input image that will be used to generate the mosaic.
* **tiles_dir**: The tiles directory we will use to read the images we will use in the mosaic generation
* **cell_width**: The width (in pixels) of each cell in the mosaic
* **cell_height**: The height (in pixels) of each cell in the mosaic
* **columns**: The number of columns (of tiles) of the mosaic
* **rows**: The number of rows (of tiles) of the mosaic
* **thumbs_read**: We will use this folder in order to read the already generated thumbs from it
* **thumbs_write**: We will use this folder in order to write the generated thumbs of the tiles
* **enable_log**: Enable console logging

## Test 

Run Typescript tests:
```sh
npm run test:ts
```
