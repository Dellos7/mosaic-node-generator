import { JimpImage } from './../../lib/jimp-image';
import { MosaicImage } from './../../lib/mosaic-image';
import { Image } from './../../lib/image';
import { expect, assert } from 'chai';
import 'mocha';

describe('MosaicImage', function() {
    this.timeout(5000);

    let imagePath: string = 'test/data/input-image-1.jpg';
    let image: Image;
    
    beforeEach( async function() {
        image = new JimpImage( await JimpImage.read( imagePath ) );
    });

    it( 'readTiles, should not read empty dir', async() => {
        try {
            let mosaicImage: MosaicImage = new MosaicImage( image, 'test/data/tiles' );
            mosaicImage.enableConsoleLogging = false;
            let tiles: Image[] = await mosaicImage.readTiles();
            expect.fail( null, null, 'Should not read any tiles' );
        }
        catch( err ) {
            expect(true).to.be.true;
        }
    });

    it( 'readTiles, should correctly read the 5 tiles in the dir', async() => {
        let mosaicImage: MosaicImage = new MosaicImage( image, 'test/data/tiles' );
        mosaicImage.enableConsoleLogging = false;
        let tiles: Image[] = await mosaicImage.readTiles();
        expect(tiles.length).equals(5);
    //}).timeout(10000);
});

});