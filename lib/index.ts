import { MosaicService } from './mosaic-service';
import * as Jimp from 'jimp';

/**
* @method: Test method
* @param {string}
* @return {string}
*/
export function test (str: string) : string {
    return 'You passed in ' + str;
}

/**
 * @method: Generates a mosaic image
 * @param {string} origImagePath The original image path
 * @param {string} tilesDirPath The tiles directory path
 */
export function mosaic(
    origImagePath: string,
    tilesDirPath: string
) {
    console.log('Generating mosaic image...');
    return null;
}

Jimp.read( 'test/data/profile.jpg', function( err, image ) {
    if(err) throw err;
    const _genMosaic1 = async() => {
        let mosaicService = new MosaicService( image, 'photos' ); 
        await mosaicService.generateMosaicImage();
        console.log('DONE GEN MOSAIC 1');
        Jimp.read( 'test/data/input-image_.jpg', function(err2, image2) {
            if(err2) throw err2;
            const _genMosaic2 = async() => {
                mosaicService = new MosaicService( image2, 'photos' );
                await mosaicService.generateMosaicImage();
                console.log('DONE GEN MOSAIC 2');
            };
            _genMosaic2();
        });
    };
    _genMosaic1();
});


/**
 * TODOS:
 * 1. Save thumbs
 * 2. Be able to load thumbs
 * 3. ¿Threading?
 * 4. Pass in memory max to node
 */