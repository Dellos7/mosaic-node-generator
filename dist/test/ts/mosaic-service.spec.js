"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mosaic_service_1 = require("./../../lib/mosaic-service");
const chai_1 = require("chai");
require("mocha");
const Jimp = require("jimp");
describe('MosaicService', function () {
    this.timeout(5000);
    let image;
    let imageCopy;
    beforeEach(function (done) {
        Jimp.read('test/data/input-image.jpg', function (err, jimpImage) {
            if (err)
                throw err;
            image = jimpImage;
            imageCopy = image.clone();
            done();
        });
    });
    it('constructor, should correctly prepare the image, use default config', () => {
        let mosaicService = new mosaic_service_1.MosaicService(imageCopy);
        chai_1.expect(mosaicService.cell_width).equals(50, 'Assert default cell width');
        chai_1.expect(mosaicService.cell_height).equals(50, 'Assert default cell width');
        chai_1.expect(mosaicService.aspect_ratio).greaterThan(1, 'Assert aspect ratio');
        chai_1.expect(mosaicService.rows).equals(80, 'Assert rows');
        //As aspect ratio is > 1, we will have more columns than the default
        chai_1.expect(mosaicService.columns).greaterThan(80, 'Assert columns');
        //We assert that the final image is greater than the original
        chai_1.expect(mosaicService.image.bitmap.width).greaterThan(image.bitmap.width);
        chai_1.expect(mosaicService.image.bitmap.height).greaterThan(image.bitmap.height);
        chai_1.expect(mosaicService.image.bitmap.width).equals(mosaicService.image_width);
        chai_1.expect(mosaicService.image.bitmap.height).equals(mosaicService.image_height);
    });
    //TODO: Add more constructor tests
    it('readTiles, should correctly read the 5 tiles in the dir', (done) => {
        let mosaicService = new mosaic_service_1.MosaicService(imageCopy, 'test/data/tiles');
        mosaicService.readTiles().then((tiles) => {
            //expect( tiles.length ).equals(5);
            done();
        }).catch((err) => {
            throw err;
        });
    }).timeout(10000);
    it('readTiles, should not read empty dir', (done) => {
        let mosaicService = new mosaic_service_1.MosaicService(imageCopy, 'test/data/tiles-empty-dir');
        mosaicService.readTiles().then((tiles) => {
            chai_1.assert.fail('Directory should be empty');
        }).catch((err) => {
            chai_1.expect(err).equals('There are no tiles in the directory');
            done();
        });
    });
    /*it( 'asyncForEach', async (done) => {
        console.log( 'generateMosaicImage, should generate mosaic image' );
        let mosaicService = new MosaicService( imageCopy, 'test/data/tiles2' );
        mosaicService.asyncForEach( [1, 2, 3], async (num: number) => {
            await new Promise( (resolve, reject) => {
                setTimeout( () => {
                    console.log(num);
                    resolve();
                }, 500 );
                //console.log('2- ' + num);
                console.log(num);
            });
        });
        console.log('END');
        done();
    }).timeout(0);*/
    it('generateMosaicImage, should generate mosaic image', (done) => {
        console.log('generateMosaicImage, should generate mosaic image');
        //let mosaicService = new MosaicService( imageCopy, 'test/data/tiles' );
        let mosaicService = new mosaic_service_1.MosaicService(imageCopy, 'photos');
        mosaicService.generateMosaicImage().then(() => {
            console.log('DONE!');
            done();
        });
    }).timeout(0);
    /*it( 'getBestTileForImage, should get best tile for image', (done) => {
        //let mosaicService = new MosaicService( imageCopy, 'photos' );
        let mosaicService = new MosaicService( imageCopy, 'test/data/tiles' );
        mosaicService.readTiles().then(
            (tiles) => {
                try {
                    mosaicService.getImageAvgColor_new( imageCopy, 0, 0, imageCopy.bitmap.width, imageCopy.bitmap.height ).then(
                        ( imageAvgColor ) => {
                            mosaicService.getBestTileForImage_new( imageAvgColor ).then(
                                (bestTile) => {
                                    expect( bestTile ).instanceof( Jimp );
                                    bestTile.write('best-tile.jpg');
                                    done();
                                }
                            );
                        }
                    );

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
    }).timeout(0);

    it( 'getImageAvgColor_new', (done) => {
        let mosaicService = new MosaicService( imageCopy, 'test/data/tiles' );
        mosaicService.getImageAvgColor_new( imageCopy, 0, 0, imageCopy.bitmap.width, imageCopy.bitmap.height ).then(
            (rgb: RGB) => {
                console.log('R: ' + rgb.r);
                console.log('G: ' + rgb.g);
                console.log('B: ' + rgb.b);
                done();
            }
        );
    });*/
    /*
    it( 'getBestTileForImage', (done) => {
        let mosaicService = new MosaicService( imageCopy, 'test/data/tiles' );
        mosaicService.readTiles().then(
            (tiles) => {
                mosaicService.getBestTileForImage( imageCopy ).then(
                    (bestTile) => {
                        bestTile.write('besttile.jpg');
                        done();
                    }
                );
            }
        );
    });*/
    /*it( 'generateMosaicImage, should generate mosaic image', (done) => {
        Jimp.read( 'test/data/target.jpg', function( err, jimpImage ) {
            let mosaicService = new MosaicService( jimpImage, 'test/data/tiles2' );
            mosaicService.generateMosaicImage();
            done();
        });
    }).timeout(0);*/
    /*it( 'getImageAvgColor_new', (done) => {
        let mosaicService = new MosaicService( imageCopy, 'test/data/tiles' );
        mosaicService.getImageAvgColor_new( imageCopy, 0, 0, imageCopy.bitmap.width, imageCopy.bitmap.height ).then(
            (imageAvgColor: RGB) => {
                console.log(`rgb: ${imageAvgColor.r}, ${imageAvgColor.g}, ${imageAvgColor.b}`);
                done();
            }
        );
    }).timeout(0);*/
});
