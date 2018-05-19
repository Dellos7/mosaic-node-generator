import * as Jimp from 'jimp';
import * as fs from 'fs';
import { RGB } from './rgb';

export class MosaicService {

    private default_cell_width: number = 50;
    private default_cell_height: number = 50;

    private default_columns: number = 120;
    private default_rows: number = 120;
    /*private default_columns: number = 50;
    private default_rows: number = 50;*/

    private default_final_image_name: string = 'output';
    private default_tiles_dir: string = 'tiles';

    orig_image: Jimp.Jimp;
    image: Jimp.Jimp;
    image_width: number = 0;
    image_height: number = 0;
    cell_width: number;
    cell_height: number;
    rows: number;
    columns: number;

    aspect_ratio: number = 0;

    final_image_name: string;
    tiles_dir: string;

    //Converted tiles into thumbs
    tiles: Jimp.Jimp[] = [];

    img_tiles_matrix: any[] = [];

    constructor( 
        image: Jimp.Jimp, 
        tiles_dir?: string,
        final_image_name?: string,
        cell_width?: number, cell_height?: number, 
        columns?: number, rows?: number ) {
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

    async asyncForEach( arr: any[], cb: any ) {
        for( let index = 0; index < arr.length; index++ ) {
            await cb( arr[index], index, arr );
        }
    }

    async asyncFor( n: number, cb: any ) {
        for( let index = 0; index < n; index++ ) {
            await cb( index );
        }
    }

    private _prepare() {
        let imageWidth = this.image.bitmap.width;
        let imageHeight = this.image.bitmap.height;
        let virtualCols = Math.ceil( imageWidth / this.cell_width );
        let virtualRows = Math.ceil( imageHeight / this.cell_height );

        //If calculated columns are greater than the default ones, we use the calculated sizes
        if( virtualCols > this.columns ) {
            this.columns = virtualCols;
            this.rows = virtualRows;
        }
        else {
            //We recalculate columns or rows depending on the aspect ratio
            if( this.aspect_ratio > 1 ) {
                this.columns = Math.ceil( this.columns * this.aspect_ratio );
            }
            else if( this.aspect_ratio < 1 ) {
                this.rows = Math.ceil( this.rows * this.aspect_ratio );
            }
        }

        let finalImageWidth = this.cell_width * this.columns;
        let finalImageHeight = this.cell_height * this.rows;
        this.image_width = finalImageWidth;
        this.image_height = finalImageHeight;
        this.image.resize( this.image_width, this.image_height );
    }

    public readTiles( tilesDir?: string ): Promise<Jimp.Jimp[]> {
        return new Promise( (resolve, reject) => {
            let _tilesDir = tilesDir ? tilesDir : this.tiles_dir;
            let i = 0;
            let numberOfTiles = fs.readdirSync( _tilesDir ).length;
            if( numberOfTiles === 0 ) {
                reject( 'There are no tiles in the directory' );
            }
            console.log(`${new Date().toString()} - Reading tiles from ${_tilesDir}, ${numberOfTiles} found...`);
            fs.readdirSync( _tilesDir ).forEach( async (tile) => {
                let jimpImg = await this.jimpRead( _tilesDir + '/' + tile );
                if( jimpImg ) {
                    jimpImg.resize( this.cell_width, this.cell_height );
                    this.tiles.push( jimpImg );
                    //jimpImg.write( 'thumbs/thumb-' + i + '.' + jimpImg.getExtension() );
                    i++;
                    if( i === numberOfTiles - 1 ) {
                        console.log(`${new Date().toString()} - Finished reading tiles`);
                        resolve( this.tiles );
                    }
                }
            });
        });
    }

    public getBestTileForImage( imageAvgColor: RGB, row: number, col: number ): Promise<Jimp.Jimp> {
        return new Promise( (resolve, reject) => {
            if( !imageAvgColor ) {
                throw new Error('No image provided');
            }
            else {
                let tilesDiff: any[] = [];
                const _gbtfi = async() => {
                    //Create an array of the tiles and diffs
                    await this.asyncForEach( this.tiles, async( tile: Jimp.Jimp, i: number ) => {
                        let rgb: RGB = await this.getImageAvgColor( tile, 0, 0, this.cell_width, this.cell_height );
                        let diff: number = imageAvgColor.getColorDistance( rgb );
                        tilesDiff.push({
                            tile_ind: i,
                            diff: diff
                        });
                    });
                    //Sort the array
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
                    if( !this.img_tiles_matrix[row] ) {
                        this.img_tiles_matrix.push([]);
                    }

                    /**
                     * Code below is what "chooses" what tile is best suitable for the current cell
                     * It prevents using the same tiles too close (in a specified area around the current cell)
                     */
                    let j: number = -1;
                    let found: boolean = false;
                    let IMGAREA: number = 4;
                    do {
                        found = true;
                        //We check if the tile we are testing exists in an IMGAREA*IMGAREA area around the current cell
                        for( let r = (row - IMGAREA) + 1; r < ( row + IMGAREA ); r++ ) {
                            for( let c = (col - IMGAREA) + 1; c < ( col + IMGAREA ); c++ ) {
                                if( this.img_tiles_matrix[r] && this.img_tiles_matrix[r][c] && this.img_tiles_matrix[r][c] === tilesDiff[j+1].tile_ind ) {
                                    found = false;
                                    break;
                                }
                            }
                            if(!found) {
                                break;
                            }
                        }
                        j++;
                        //Security code (maybe necessari when using too few tiles)
                        /*if( j === (tilesDiff.length - 1) ) {
                            j = 0;
                            found = true;
                        }*/
                    } while( !found );

                    let bestTile: Jimp.Jimp = this.tiles[tilesDiff[j].tile_ind];
                    this.img_tiles_matrix[row][col] = tilesDiff[j].tile_ind;
                    resolve(bestTile);
                };
                _gbtfi();
            }
        });
    }

    public generateMosaicImage( tilesDir? : string ) {
        return new Promise( (resolve, reject) => {
            /**
             * 1. Read tiles --> generate tile thumbs
             * 2. Generate the mosaic image
             */
            this.readTiles( tilesDir ).then(
                (tiles) => {
                    //this._generateMosaicImage( 0, 0, 1, this.columns );
                    this._generateMosaicImage( 0, 0, this.rows, this.columns ).then(
                        () => {
                            console.log(`${new Date().toString()} - Mosaic image generated.`);
                            this.save();
                            resolve();
                        }
                    );
                }
            )
            .catch(
                (err) => {
                    throw err;
                }
            );
        });
    }

    public generateMosaicImage_new( tilesDir? : string ) {
        /**
         * 1. Read tiles --> generate tile thumbs
         * 2. Generate the mosaic image. Split image in parts to improve performance
         */
        this.readTiles( tilesDir ).then(
            (tiles) => {
                const SPLIT_INTO: number = 4;
                let nRows: number = Math.floor(this.rows / (SPLIT_INTO/2));
                let nCols: number = Math.floor(this.columns / (SPLIT_INTO/2));
                let genMosaicSplitPromises: Promise<any>[] = [];
                for( let i = 0; i < (SPLIT_INTO/2); i++ ) {
                    for( let j = 0; j < (SPLIT_INTO/2); j++ ) {
                        console.log(`This will generate a partial mosaic (${i}, ${j})`);
                        let promise = this._generateMosaicImage( i * nRows, j * nCols, nRows, nCols );
                        genMosaicSplitPromises.push( promise );
                        //break; //
                    }
                    //break; //
                }
                Promise.all( genMosaicSplitPromises ).then(
                    () => {
                        console.log(`${new Date().toString()} - All promises have finished.`);
                        this.save();
                    }
                );
            }
        )
        .catch(
            (err) => {
                throw err;
            }
        );
    }

    private _generateMosaicImage( rowStart: number, colStart: number, numRows: number, numCols: number ): Promise<any> {
        return new Promise( (resolve, reject) => {
            console.log(`${new Date().toString()} - Generating mosaic from (${rowStart}, ${colStart}) 
                        to (${rowStart + numRows}, ${colStart + numCols})`);
            const _process = async() => {
                for( let row = rowStart; row < numRows; row++ ) {
                    console.log(`- ${new Date().toString()} - Start Row ${row}`);
                    //for( let col = colStart; col < numCols; col++ ) {
                    //TODO: test without async for
                    await this.asyncFor( numCols,  async( col: number ) => {
                        //Get average color of the current cell
                        let imageAvgColor: RGB = await this.getImageAvgColor( this.image, col * this.cell_width, row * this.cell_height, this.cell_width, this.cell_height );
                        //Get the best tile for this average color
                        let bestTile: Jimp.Jimp = await this.getBestTileForImage( imageAvgColor, row, col );
                        
                        //Composite the calculated tile in the final image
                        this.image.composite( bestTile, col * this.cell_width, row * this.cell_height );
                    });
                    //}
                    console.log(`- ${new Date().toString()} - End Row ${row}`);
                }
                console.log('RESOLVING!');
                resolve();
            };
            _process();
        });
    }

    public cropImage( x: number, y: number, w: number, h: number ) {
        let origImageClone: Jimp.Jimp = this.orig_image.clone();
        return origImageClone.crop( x, y, w, h );
    }

    public save( imageName?: string ) {
        console.log(`- ${new Date().toString()} - Saving output image...`);
        let outputImageName = 
            (imageName ? imageName : this.final_image_name) 
            + '_' 
            + new Date().getTime() 
            + '.jpg';
        this.image.write( outputImageName, () => {
            console.log(`- ${new Date().toString()} - END Saving output image!!`);
        });
    }

    private jimpRead( path: string ): Promise<Jimp.Jimp> {
        return new Promise<Jimp.Jimp>( (resolve, reject) => {
            try {
                Jimp.read( path, (err, jimp) => {
                    if(err instanceof Error) {
                        //If this is the error, do not handle it as the api
                        //already tries to read the file twice
                        if( !err.message.includes( 'Invalid file signature' ) ) {
                            throw err;
                        }
                    }
                    resolve(jimp);
                });
            }
            catch( err ) {
                reject(err);
            }
        });
    }

    getImageAvgColor( image: Jimp.Jimp, x_start: number, y_start: number, width: number, height: number ): Promise<RGB> {
        return new Promise<RGB>( (resolve, reject) => {
            let r = 0, g = 0, b = 0;
            let i = 0;
            image.scan(x_start, y_start, width, height, function (x, y, idx) {
                r += image.bitmap.data[ idx + 0 ];
                g += image.bitmap.data[ idx + 1 ];
                b += image.bitmap.data[ idx + 2 ];
                i++;
                if(x === (x_start + width)-1 && y === (y_start + height)-1) {
                    let red = Math.round( r / i );
                    let green = Math.round( g / i );
                    let blue = Math.round( b / i );
                    resolve(new RGB(
                        red,
                        green,
                        blue
                    ));
                }
            });
        });
    }
    
}