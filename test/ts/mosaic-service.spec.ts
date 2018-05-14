import { MosaicService } from './../../lib/mosaic-service';
import { expect, assert } from 'chai';
import 'mocha';
import * as Jimp from 'jimp';

describe('MosaicService', function() {
    this.timeout(5000);

    let image: Jimp.Jimp;
    let imageCopy: Jimp.Jimp;
    
    beforeEach( function(done) {
        Jimp.read( 'test/data/input-image.jpg', function( err, jimpImage ) {
            if(err) throw err;
            image = jimpImage;
            imageCopy = image.clone();
            done();
        });
    });

    it('constructor, should correctly prepare the image, use default config', () => {
        let mosaicService = new MosaicService( imageCopy );
        expect( mosaicService.cell_width ).equals( 50, 'Assert default cell width' );
        expect( mosaicService.cell_height ).equals( 50, 'Assert default cell width' );
        expect( mosaicService.aspect_ratio ).greaterThan( 1, 'Assert aspect ratio' );
        expect( mosaicService.rows ).equals( 120, 'Assert rows' );
        //As aspect ratio is > 1, we will have more columns than the default
        expect( mosaicService.columns ).greaterThan( 120, 'Assert columns' );
        //We assert that the final image is greater than the original
        expect( mosaicService.image.bitmap.width ).greaterThan( image.bitmap.width );
        expect( mosaicService.image.bitmap.height ).greaterThan( image.bitmap.height );
        expect( mosaicService.image.bitmap.width ).equals( mosaicService.image_width );
        expect( mosaicService.image.bitmap.height ).equals( mosaicService.image_height );
    });

    //TODO: Add more constructor tests

    it( 'readTiles, should correctly read the 5 tiles in the dir', (done) => {
        let mosaicService = new MosaicService( imageCopy, 'test/data/tiles' );
        mosaicService.readTiles().then(
            (tiles) => {
                expect( tiles.length ).equals(5);
                done();
            }
        ).catch(
            (err) => {
                throw err;
            }
        );
    }).timeout(10000);

    it( 'readTiles, should not read empty dir', (done) => {
        let mosaicService = new MosaicService( imageCopy, 'test/data/tiles-empty-dir' );
        mosaicService.readTiles().then(
            (tiles) => {
                assert.fail('Directory should be empty');
            }
        ).catch(
            (err) => {
                expect( err ).equals( 'There are no tiles in the directory' );
                done();
            }
        );
    });

    it( 'getBestTileForImage, should get best tile for image', (done) => {
        let mosaicService = new MosaicService( imageCopy, 'test/data/tiles' );
        mosaicService.readTiles().then(
            (tiles) => {
                try {
                    let bestTile = mosaicService.getBestTileForImage( imageCopy );
                    expect( bestTile ).instanceof( Jimp );
                    done();
                }
                catch( err ) {
                    throw err;
                }
            }
        ).catch(
            (err) => {
                throw err;
            }
        );
    }).timeout(40000);

    it( 'generateMosaicImage, should generate mosaic image', (done) => {
        //let mosaicService = new MosaicService( imageCopy, 'test/data/tiles' );
        let mosaicService = new MosaicService( imageCopy, 'photos' );
        //mosaicService.generateMosaicImage();
    }).timeout(0);

});