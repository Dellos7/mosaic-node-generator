/// <reference path="../../node_modules/jimp/jimp.d.ts" />
import { Image } from './image';
import { RGB } from './rgb';
export declare class JimpImage implements Image {
    image: Jimp.Jimp;
    constructor(image: Jimp.Jimp);
    /**
     * Static method
     * Convert the image to Jimp image from path
     * Usage: JimpImage.read( 'input-image.jpg' );
     * @param path
     */
    static read(path: string): Promise<any>;
    /**
     * Convert the image to Jimp image from path
     * Usage: JimpImage.read( 'input-image.jpg' );
     * @param path
     */
    read(path: string): Promise<any>;
    /**
     * Write the image to disk
     * @param imageName
     */
    save(imageName?: string): Promise<string>;
    /**
     * Resize the image to the new width and height
     * @param newWidth
     * @param newHeight
     */
    resize(newWidth: number, newHeight: number): void;
    /**
     * Paste the given image to the given x and y cords
     * @param image
     * @param x
     * @param y
     */
    composite(image: Image, x: number, y: number): void;
    /**
     * Get the average color of the specified area of the image
     * @param x_start left-top corner x cord of the area
     * @param y_start left-top corner y cord of the area
     * @param width width in pixels of the area
     * @param height height in pixels of the area
     */
    getAverageColor(x_start?: number, y_start?: number, width?: number, height?: number): RGB | Promise<RGB>;
    /**
     * Get the width in pixels of the image
     */
    getWidth(): number;
    /**
     * Get the height in pixels of the image
     */
    getHeight(): number;
    /**
     * Get the aspect ratio (width/height) of the image
     */
    getAspectRatio(): number;
}
