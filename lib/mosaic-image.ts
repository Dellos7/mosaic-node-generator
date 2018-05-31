import { CONFIG } from './mosaic-default-config.json';
import { JimpImage } from './jimp-image';
import { Image } from './image';
import * as fs from 'fs';
import { RGB } from './rgb';

class TileIndexAndDifference {
    public tileInd: number;
    public diff: number;

    constructor( tileInd: number, diff: number ) {
        this.tileInd = tileInd;
        this.diff = diff;
    }
}

export class MosaicImage {

    //The output image that will be created as mosaic
    public image: Image;
    //The folder of the tiles we use in order to generate the mosaic
    public tilesDirectory: string;
    //The width in pixels of each cell of the final image
    public cellWidth: number;
    //The height in pixels of each cell of the final image
    public cellHeight: number;
    //The number of columns of the final image
    public columns: number;
    //The number of rows of the final image
    public rows: number;
    //The tiles (converted to thumbs of cellWidth * cellHeight px) read from the tiles folder or the thumbs one
    public tiles: Image[] = [];
    //This matrix stores in each cell the index of the tile that will be composed in that cell in the final image
    //Used in order not to repeat the same cells in a given area
    public tilesIndexMatrix: number[][] = [];
    //The folder from which we will read the thumbs if we don't want to re-size the tiles
    public thumbsDirectoryFromRead: string | null;
    //If we want we can save the resized thumbs in this folder
    public thumbsDirectoryToWrite: string | null;
    //If we want to enable logs in the console
    public enableConsoleLogging: boolean;

    constructor( 
        image: Image, 
        tilesDirectory?: string,
        cellWidth?: number, 
        cellHeight?: number, 
        columns?: number, 
        rows?: number,
        thumbsDirectoryFromRead?: string,
        thumbsDirectoryToWrite?: string,
        enableConsoleLogging: boolean = true
    ) {
        this.image = image;
        this.tilesDirectory = tilesDirectory ? tilesDirectory : CONFIG.tiles_directory;
        this.cellWidth = cellWidth ? cellWidth : CONFIG.cell_width;
        this.cellHeight = cellHeight ? cellHeight : CONFIG.cell_height;
        this.columns = columns ? columns: CONFIG.columns;
        this.rows = rows ? rows: CONFIG.rows;
        this.thumbsDirectoryFromRead = thumbsDirectoryFromRead ? thumbsDirectoryFromRead : null;
        this.thumbsDirectoryToWrite = thumbsDirectoryToWrite ? thumbsDirectoryToWrite : null;
        this.enableConsoleLogging = enableConsoleLogging;
        this._prepare();
    }

    /**
     * Recalculate columns and rows depending on the aspect ratio of the image
     * Resize the final image depending on the cell width and height, rows, columns...
     */
    private _prepare() {
        let imageWidth = this.image.getWidth();
        let imageHeight = this.image.getHeight();
        let virtualCols = Math.ceil( imageWidth / this.cellWidth );
        let virtualRows = Math.ceil( imageHeight / this.cellHeight );

        //If calculated columns are greater than the default ones, we use the calculated sizes
        if( virtualCols > this.columns ) {
            this.columns = virtualCols;
            this.rows = virtualRows;
        }
        else {
            //We recalculate columns or rows depending on the aspect ratio, because we are making the final image bigger
            if( this.image.getAspectRatio() > 1 ) {
                this.columns = Math.ceil( this.columns * this.image.getAspectRatio() );
            }
            else if( this.image.getAspectRatio() < 1 ) {
                this.rows = Math.ceil( this.rows * ( 2 - this.image.getAspectRatio() ) );
            }
        }

        let finalImageWidth = this.cellWidth * this.columns;
        let finalImageHeight = this.cellHeight * this.rows;
        this.image.resize( finalImageWidth, finalImageHeight );
    }

    /**
     * Helps calculate progress percentajes
     * @param currentRow 
     * @param totalRows 
     */
    private _calcProgress( current: number, total: number ) {
        return Math.round( ((current / total)*100)*100 ) / 100;
    }

    /**
     * Basically reads all the tiles (pictures) from a folder, parses them as 'Image' objects and stores in the 'tiles' attribute
     * @param tilesDirectory 
     */
    private _readTiles( tilesDirectory?: string ): Promise<Image[]> {
        return new Promise<Image[]>( (resolve, reject) => {
            let _tilesDir = tilesDirectory ? tilesDirectory : this.tilesDirectory;
            let numberOfTiles = fs.readdirSync( _tilesDir ).length;
            if( numberOfTiles === 0 ) {
                throw new Error('There are no tiles in the directory ' + _tilesDir);
            }
            if(this.enableConsoleLogging) console.log(`${new Date().toString()} - Reading tiles from ${_tilesDir}, ${numberOfTiles} found...`);
            let i = 0;
            fs.readdirSync( _tilesDir ).forEach( async (tile) => {
                let img = await JimpImage.read( _tilesDir + '/' + tile ).catch( (err) => { if(this.enableConsoleLogging) console.log( 'Warning: aborting read of ' + tile) } );
                if(this.enableConsoleLogging) console.log(`${new Date().toString()} - [Tiles read] ${i}/${numberOfTiles}. Progress: ${this._calcProgress(i, numberOfTiles)}%`);
                if( img ) {
                    let image: Image = new JimpImage( img );
                    image.resize( this.cellWidth, this.cellHeight );
                    this.tiles.push( image );
                    i++;
                    if( i === numberOfTiles ) {
                        if(this.enableConsoleLogging) console.log(`${new Date().toString()} - Finished reading tiles.`);
                        resolve( this.tiles );
                    }
                }
            });
        });
    }

    /**
     * If attribute 'thumbsDirectoryFromRead' is true, it reads tiles as thumbs from the given thumbs folder
     * It does not resize them as they are supposed to be already thumbnails
     */
    private _readThumbs(): Promise<Image[]> {
        return new Promise<Image[]>( (resolve, reject) => {
            if( this.thumbsDirectoryFromRead ) {
                let i = 0;
                try {
                    let numberOfThumbs = fs.readdirSync( this.thumbsDirectoryFromRead ).length;
                    if( numberOfThumbs === 0 ) {
                        throw new Error('There are no thumbs in the directory ' + this.thumbsDirectoryFromRead);
                    }
                    if(this.enableConsoleLogging) console.log(`${new Date().toString()} - Reading thumbs from ${this.thumbsDirectoryFromRead}, ${numberOfThumbs} found...`);
                    fs.readdirSync( this.thumbsDirectoryFromRead ).forEach( async (thumb) => {
                        let img = await JimpImage.read( this.thumbsDirectoryFromRead + '/' + thumb ).catch( (err) => console.log( 'Warning: aborting read of ' + thumb) );
                        if( img ) {
                            let image: Image = new JimpImage( img );
                            this.tiles.push( image );
                            i++;
                            if( i === numberOfThumbs - 1 ) {
                                if(this.enableConsoleLogging) console.log(`${new Date().toString()} - Finished reading thumbs`);
                                resolve( this.tiles );
                            }
                        }
                    });
                }
                catch( err ) {
                    reject(err);
                }
            }
            else {
                throw new Error('Thumb directory not specified');
            }
        });
    }

    /**
     * Saves the tiles in the 'thumbsDirectoryToWrite' folder, so we can use them later in order to save time
     */
    public generateThumbs() {
        if( this.thumbsDirectoryToWrite ) {
            if(this.enableConsoleLogging) console.log(`${new Date().toString()} Start saving thumbs to ${this.thumbsDirectoryToWrite}...`);
            let i = 0;
            let n = this.tiles.length;
            for( let tile of this.tiles ) {
                if(this.enableConsoleLogging) console.log(`${new Date().toString()} - [Thumbs save] ${i}/${n}. Progress: ${this._calcProgress(i, n)}%`);
                tile.save( `${this.thumbsDirectoryToWrite}/thumb-${i}` );
                i++;
            }
            if(this.enableConsoleLogging) console.log(`${new Date().toString()} End saving thumbs! --> ${this.thumbsDirectoryToWrite}`);
        }
    }

    /**
     * Decides to read the tiles or read the thumbnails
     * @param tilesDirectory 
     */
    public readTiles( tilesDirectory?: string ): Promise<Image[]> {  
        return new Promise<Image[]>( (resolve, reject) => {
            if( this.thumbsDirectoryFromRead ) {
                this._readThumbs().then( (imgs) => resolve(imgs) ).catch( (err) => reject(err) );
                //return this._readThumbs();
            }
            else {
                this._readTiles( tilesDirectory ).then( (imgs) => resolve(imgs) ).catch( (err) => reject(err) ) ;
                //return this._readTiles( tilesDirectory );
            } 
        });      
    }

    /**
     * This is the core function. For each cell (row,col) of the image, it calculates the average color of that zone
     * Then, it calculates the best tile that suits in that zone calculating the difference within all the tiles
     * When we know which tile we will use for that zone, we "paste" that tile in our output image, in the appropiate coords
     * @param rowStart 
     * @param colStart 
     * @param numRows 
     * @param numCols 
     */
    public processRowsAndColumns( rowStart: number, colStart: number, numRows: number, numCols: number ): Promise<any> {
        return new Promise( async(resolve, reject) => {
            if(this.enableConsoleLogging) console.log(`${new Date().toString()} - Generating mosaic from (${rowStart}, ${colStart}) to (${rowStart + numRows}, ${colStart + numCols})`);
            for( let row = rowStart; row < numRows; row++ ) {
                const _processColsForRow = async(): Promise<any> => {
                    console.log(`- ${new Date().toString()} - [Mosaic creation]. Progress: ${this._calcProgress(row, numRows)}%`);
                    for( let col = colStart; col < numCols; col++ ) {
                        //Get average color of the current cell
                        let imageAvgColor: RGB = await this.image.getAverageColor( col * this.cellWidth, row * this.cellHeight, this.cellWidth, this.cellHeight );
                        //Get the best tile from our tiles array for this average color
                        let bestTile: Image = await this.getBestTileForImage( imageAvgColor, row, col );
                        //Composite the calculated tile in the final image
                        this.image.composite( bestTile, col * this.cellWidth, row * this.cellHeight );
                    }
                    Promise.resolve();
                };
                await _processColsForRow();
            }
            resolve();
        });
    }

    /**
     * Calculates the best tile for the given RGB colour. It compares the given rgb colour with all the tiles and decides which one is more suitable
     * The algorithm also tries to prevent the use of the same thumb in a too close area
     * @param imageAvgColor 
     * @param row 
     * @param col 
     */
    public getBestTileForImage( imageAvgColor: RGB, row: number, col: number ): Promise<Image> {
        return new Promise( (resolve, reject) => {
            if( !imageAvgColor ) {
                throw new Error('No image provided');
            }
            else {
                let tilesDiff: TileIndexAndDifference[] = [];
                const _getBestTileForImage = async() => {
                    //Create an array of the differences between the given rgb and all the tiles
                    for( let i = 0; i < this.tiles.length; i++ ) {
                        let tile: Image = this.tiles[i];
                        let rgb: RGB = await tile.getAverageColor(  0, 0, this.cellWidth, this.cellHeight );
                        let diff: number = imageAvgColor.getColorDistance( rgb );
                        tilesDiff.push( new TileIndexAndDifference( i, diff ) );
                    }
                    
                    //Sort the array (smaller differences first)
                    tilesDiff = tilesDiff.sort( (tile1, tile2) => {
                        if( tile1.diff > tile2.diff ) {
                            return 1;
                        }
                        if( tile1.diff < tile2.diff ) {
                            return -1;
                        }
                        return 0;
                    });

                    //If row does not exist in matrix, create it
                    if( !this.tilesIndexMatrix[row] ) {
                        this.tilesIndexMatrix.push([]);
                    }

                    /**
                     * Code below is what "chooses" what tile is more suitable for the current cell
                     * It prevents using the same tiles too close (in a specified area around the current cell)
                     */
                    let j: number = -1;
                    let found: boolean = false;
                    let IMGAREA: number = CONFIG.area_prevent_same_images;
                    do {
                        found = true;
                        //We check if the tile we are testing exists in an IMGAREA*IMGAREA area around the current cell
                        for( let r = (row - IMGAREA) + 1; r < ( row + IMGAREA ); r++ ) {
                            for( let c = (col - IMGAREA) + 1; c < ( col + IMGAREA ); c++ ) {
                                if( this.tilesIndexMatrix[r] && this.tilesIndexMatrix[r][c] && this.tilesIndexMatrix[r][c] === tilesDiff[j+1].tileInd ) {
                                    found = false;
                                    break;
                                }
                            }
                            if(!found) {
                                break;
                            }
                        }
                        j++;
                    } while( !found );

                    let bestTile: Image = this.tiles[tilesDiff[j].tileInd];
                    this.tilesIndexMatrix[row][col] = tilesDiff[j].tileInd;
                    resolve(bestTile);
                };
                _getBestTileForImage();
            }
        });
    }

    /**
     * 1. Read the tiles from disk
     * 2. Process the image (calculate the tiles for each cell in the image)
     * 3. Save the image in disk
     */
    public generate(): Promise<any> {
        return new Promise<any>( (resolve, reject) => {
            const _generate = async () => {
                //First, we read the tiles from disk
                await this.readTiles().catch( (err) => Promise.reject(err) );
                if( this.tiles.length > 0 ) {
                    //Then we process the image and generate the mosaic
                    await this.processRowsAndColumns( 0, 0, this.rows, this.columns ).catch( (err) => Promise.reject(err) );
                    console.log('Saving mosaic image...');
                    //Save the image in disk
                    let outputImageName = await this.image.save().catch( (err) => Promise.reject(err) );
                    console.log('Mosaic image saved! --> ' + outputImageName);
                    //Finally we generate the thumbs folder in order to save time in following executions
                    this.generateThumbs();
                    resolve();
                }
                else {
                    reject(`Tiles were not loaded`);
                }
            };
            _generate().catch( (err) => { reject(err)} );
        });
    }

}