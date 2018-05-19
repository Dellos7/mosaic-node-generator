import { Image } from './image';
import { RGB } from './rgb';
export declare class JimpImage implements Image {
    image: Jimp.Jimp;
    constructor(image: Jimp.Jimp);
    static read(path: string): Promise<any>;
    read(path: string): Promise<any>;
    save(imageName?: string): Promise<string>;
    resize(newWidth: number, newHeight: number): void;
    composite(image: Image, x: number, y: number): void;
    getAverageColor(x_start?: number, y_start?: number, width?: number, height?: number): RGB | Promise<RGB>;
    getWidth(): number;
    getHeight(): number;
    getAspectRatio(): number;
}
