import { JimpImage } from './../../lib/jimp-image';
import { expect, assert } from 'chai';
import 'mocha';
import * as fs from 'fs';
import { RGB } from './../../lib/rgb';

describe( 'JimpImage', function() {

    let imagePath1: string = 'test/data/input-image-1.jpg';
    let imagePath2: string = 'test/data/input-image-2.jpg';
    let badImagePath: string = 'test/data/bad-image-path.jpg';

    it( 'static read, should correctly read image', () => {
        JimpImage.read( imagePath1 ).then(
            (image) => {
                expect( image ).not.null;
            }
        );
    });

    it( 'static read, should not be able to read image', () => {
        JimpImage.read( badImagePath ).then(
            (image) => {
                expect.fail( null, null, 'Should not be able to read image ' + badImagePath );
            }
        ).catch(
            (err) => {
                expect(true).to.be.true;
            }
        );
    });

    it( 'constructor, should correctly create image', async() => {
        let image: JimpImage = new JimpImage( await JimpImage.read( imagePath1 ) );
        expect( image ).not.null;
        expect( image.getWidth() ).equals( 1000 );
        expect( image.getHeight() ).equals( 667 );
    });

    it( 'constructor, should not create image', async() => {
        let image;
        try {
            image = new JimpImage( await JimpImage.read( badImagePath ) );
            expect.fail( null, null, 'Should not create image ' + badImagePath );
        }
        catch(err) {
            expect(image).to.be.undefined;
        }
    });

    it( 'save, should save image in disk', async() => {
        let image: JimpImage = new JimpImage( await JimpImage.read( imagePath1 ) );
        await image.save( 'image-output' );
        fs.readFile( 'image-output.jpg', null, (err, _) => {
            if(err) expect.fail( null, null, 'Should read image from disk' );
            expect(true).to.be.true;
            fs.unlink( 'image-output.jpg', (err) => {
                if(err) expect.fail( null, null, 'Could not remove image from disk' );
            });
        });
    });

    it( 'resize, should resize image', async() => {
        let image: JimpImage = new JimpImage( await JimpImage.read( imagePath1 ) );
        image.resize( 500, 300 );
        expect( image.getWidth() ).equals( 500 );
        expect( image.getHeight() ).equals( 300 );
    });

    it( 'getAverageColor, should correctly get the average color of the image', async() => {
        let expectAvg_r: number = 110;
        let expectAvg_g: number = 141;
        let expectAvg_b: number = 64;
        let image: JimpImage = new JimpImage( await JimpImage.read( imagePath1 ) );
        let rgb: RGB = await image.getAverageColor( 0, 0, image.getWidth(), image.getHeight() );
        expect( rgb.r ).equals( expectAvg_r );
        expect( rgb.g ).equals( expectAvg_g );
        expect( rgb.b ).equals( expectAvg_b );
    });

    it( 'composite, should correctly composite one image into another', async() => {
        let image: JimpImage = new JimpImage( await JimpImage.read( imagePath1 ) );
        let imageComp: JimpImage = new JimpImage( await JimpImage.read( imagePath2 ) );
        imageComp.resize( 100, 100 );
        let rgb_imageComp: RGB = await imageComp.getAverageColor( 0, 0, imageComp.getWidth(), imageComp.getHeight() );
        
        image.composite( imageComp, 0, 0 );

        //We test if the image has successfully been composited if the average RGB of the tile composited
        //and the average RGB of the final image zone where it has been composited match
        let rgb_compImage: RGB = await image.getAverageColor( 0, 0, 100, 100 );
        expect( rgb_compImage.r ).equals( rgb_imageComp.r );
        expect( rgb_compImage.g ).equals( rgb_imageComp.g );
        expect( rgb_compImage.b ).equals( rgb_imageComp.b );
    });

    it( 'getAspectRatio, should correctly get aspect ratio', async() => {
        let image: JimpImage = new JimpImage( await JimpImage.read( imagePath1 ) );
        expect( image.getAspectRatio() ).to.be.closeTo( 1.5, 0.1 );
    });

});