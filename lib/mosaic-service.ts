import * as Jimp from 'jimp';
import * as fs from 'fs';

//const TILE_DIFF_THRESHOLD: number = 0.15;
const TILE_DIFF_THRESHOLD: number = 0.05;

export class MosaicService {

    private default_cell_width: number = 50;
    private default_cell_height: number = 50;

    /*private default_columns: number = 120;
    private default_rows: number = 120;*/
    private default_columns: number = 80;
    private default_rows: number = 80;

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

    public getBestTileForImage( image: Jimp.Jimp ): Jimp.Jimp {
        if( !image ) {
            throw new Error('No image provided');
        }
        else {
            let bestTile: Jimp.Jimp = image;
            let bestDiff: number = 1;
            let found: boolean = false;
            for( let tile of this.tiles ) {
                //Get the distance between two images. It gives us a number between 0-1,
                //where 0 is identical files
                let diff: number = Jimp.distance( image, tile );
                if( diff < bestDiff ) {
                    bestTile = tile;
                    bestDiff = diff;
                    found = true;
                    //We set this threshold as it's a good one, so this way we stop the comparison
                    //This is to improve performance
                    if( diff <= TILE_DIFF_THRESHOLD ) {
                        break;
                    }
                }
            }
            if( !found ) {
                throw new Error( 'Could not find a suitable tile, images are too different' );
            }
            return bestTile;
        }
    }

    public generateMosaicImage_old( tilesDir? : string ) {
        /**
         * 1. Read tiles --> generate tile thumbs
         * 2. Generate the mosaic image
         */
        this.readTiles( tilesDir ).then(
            (tiles) => {
                //this._generateMosaicImage( 0, 0, 1, this.columns );
                this._generateMosaicImage( 0, 0, this.rows, this.columns );
            }
        )
        .catch(
            (err) => {
                throw err;
            }
        );
    }

    public generateMosaicImage( tilesDir? : string ) {
        /**
         * 1. Read tiles --> generate tile thumbs
         * 2. Generate the mosaic image. Split image in parts to improve performance
         */
        this.readTiles( tilesDir ).then(
            (tiles) => {
                const SPLIT_INTO: number = 4;
                let nRows: number = Math.floor(this.rows / SPLIT_INTO);
                let nCols: number = Math.floor(this.columns / SPLIT_INTO);
                let genMosaicSplitPromises: Promise<any>[] = [];
                for( let i = 0; i < (SPLIT_INTO/2); i++ ) {
                    for( let j = 0; j < (SPLIT_INTO/2); j++ ) {
                        let promise = this._generateMosaicImage( i * nRows, j * nCols, nRows, nCols );
                        genMosaicSplitPromises.push( promise );
                    }
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

    private _generateMosaicImage_old( rowStart: number, colStart: number, numRows: number, numCols: number ) {
        console.log(`${new Date().toString()} - Generating mosaic from (${rowStart}, ${colStart}) 
                    to (${rowStart + numRows}, ${colStart + numCols})`);
        for( let row = rowStart; row < numRows; row++ ) {
            console.log(`- ${new Date().toString()} - Start Row ${row}`);
            for( let col = colStart; col < numCols; col++ ) {
                console.log(`-- ${new Date().toString()} - [Row ${row}] Start Col ${col}`);
                let croppedImg: Jimp.Jimp = 
                    this.cropImage( col * this.cell_width, row * this.cell_height, 
                                    this.cell_width, this.cell_height );
                console.log(`-- ${new Date().toString()} - [Row ${row}] Start getBestTileForImage`);
                let bestTile: Jimp.Jimp = this.getBestTileForImage( croppedImg );
                console.log(`-- ${new Date().toString()} - [Row ${row}] End getBestTileForImage`);
                //composite image
                this.image.composite( bestTile, col * this.cell_width, row * this.cell_height );
                console.log(`-- ${new Date().toString()} - [Row ${row}] End Col ${col}`);
            }
            console.log(`- ${new Date().toString()} - End Row ${row}`);
            if( row === 1 ) {
                break;
            }
        }
        this.save();
    }

    private _generateMosaicImage( rowStart: number, colStart: number, numRows: number, numCols: number ): Promise<any> {
        return new Promise( (resolve, reject) => {
            console.log(`${new Date().toString()} - Generating mosaic from (${rowStart}, ${colStart}) 
                        to (${rowStart + numRows}, ${colStart + numCols})`);
            for( let row = rowStart; row < numRows; row++ ) {
                console.log(`- ${new Date().toString()} - Start Row ${row}`);
                for( let col = colStart; col < numCols; col++ ) {
                    console.log(`-- ${new Date().toString()} - [Row ${row}] Start Col ${col}`);
                    let croppedImg: Jimp.Jimp = 
                        this.cropImage( col * this.cell_width, row * this.cell_height, 
                                        this.cell_width, this.cell_height );
                    console.log(`-- ${new Date().toString()} - [Row ${row}] Start getBestTileForImage`);
                    let bestTile: Jimp.Jimp = this.getBestTileForImage( croppedImg );
                    console.log(`-- ${new Date().toString()} - [Row ${row}] End getBestTileForImage`);
                    //composite image
                    this.image.composite( bestTile, col * this.cell_width, row * this.cell_height );
                    console.log(`-- ${new Date().toString()} - [Row ${row}] End Col ${col}`);
                }
                console.log(`- ${new Date().toString()} - End Row ${row}`);
                /*if( row === 1 ) {
                    break;
                }*/
            }
            resolve();
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
    
}