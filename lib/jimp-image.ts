/// <reference path="../node_modules/jimp/jimp.d.ts" />

import { Image } from './image';
import { RGB } from './rgb';
import * as Jimp from 'jimp';
import { CONFIG } from './mosaic-default-config.json';

export class JimpImage implements Image {

    public image: Jimp.Jimp;

    constructor( image: Jimp.Jimp ) {
        this.image = image;
    }

    /**
     * Static method
     * Convert the image to Jimp image from path
     * Usage: JimpImage.read( 'input-image.jpg' );
     * @param path 
     */
    public static read( path: string ): Promise<any> {
        return new Promise<any>( (resolve, reject) => {
            Jimp.read( path, function( err, image ) {
                if(err instanceof Error) {
                    //If this is the error, do not handle it as the api
                    //already tries to read the file twice
                    if( !err.message.includes( 'Invalid file signature' ) ) {
                        console.log('throwing error');
                        reject(err);
                    }
                }
                if( !image ) {
                    reject('Could not read image ' + path);
                }
                else {
                    resolve(image);
                }
            });
        });
    }

    /**
     * Convert the image to Jimp image from path
     * Usage: JimpImage.read( 'input-image.jpg' );
     * @param path 
     */
    public read( path: string ): Promise<any> {
        return JimpImage.read( path );
    }

    /**
     * Write the image to disk
     * @param imageName 
     */
    public save( imageName?: string ): Promise<string> {
        return new Promise<any>( (resolve, reject) => {
            let outputImageName = '';
            if( imageName ) {
                outputImageName = imageName + '.jpg';
            }
            else {
                outputImageName = CONFIG.output_image_name + '_' + new Date().getTime() + '.jpg';
            }
            this.image.write( outputImageName, ( err, _ ) => {
                if( err ) {
                    reject(err);
                }
                else {
                    resolve( outputImageName );
                }
            });
        });
    }

    /**
     * Resize the image to the new width and height
     * @param newWidth 
     * @param newHeight 
     */
    public resize( newWidth: number, newHeight: number ): void {
        this.image.resize( newWidth, newHeight );
    }

    /**
     * Paste the given image to the given x and y cords
     * @param image 
     * @param x 
     * @param y 
     */
    public composite( image: Image, x: number, y: number ): void {
        if( image instanceof JimpImage ) {
            let img = image as JimpImage;
            this.image.composite( img.image, x, y );
        }
        else {
            throw new Error('image is not an instance of JimpImage');
        }
    }

    /**
     * Get the average color of the specified area of the image
     * @param x_start left-top corner x cord of the area
     * @param y_start left-top corner y cord of the area
     * @param width width in pixels of the area
     * @param height height in pixels of the area
     */
    public getAverageColor( x_start: number = 0, y_start: number = 0, 
                            width: number = this.image.bitmap.width, height: number = this.image.bitmap.height ): RGB | Promise<RGB> {
        let self = this;
        return new Promise<RGB>( (resolve, reject) => {
            let r = 0, g = 0, b = 0;
            let i = 0;
            this.image.scan(x_start, y_start, width, height, function (x, y, idx) {
                r += self.image.bitmap.data[ idx + 0 ];
                g += self.image.bitmap.data[ idx + 1 ];
                b += self.image.bitmap.data[ idx + 2 ];
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

    /**
     * Get the width in pixels of the image
     */
    public getWidth(): number {
        return this.image.bitmap.width;
    }

    /**
     * Get the height in pixels of the image
     */
    public getHeight(): number {
        return this.image.bitmap.height;
    }

    /**
     * Get the aspect ratio (width/height) of the image
     */
    public getAspectRatio(): number {
        return this.getWidth() / this.getHeight();
    }

}