import { CONFIG } from './lib/mosaic-default-config.json';
import { RGB } from './lib/rgb';
import { Image } from './lib/image';
import { JimpImage } from './lib/jimp-image';
import { MosaicImage } from './lib/mosaic-image';
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