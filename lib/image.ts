import { RGB } from './rgb';

export interface Image {

    read( path: string ): Promise<any> | void;
    save( imageName?: string ): Promise<string> | void;
    resize( newWidth: number, newHeight: number ): Promise<any> | void;
    composite( image: Image, x: number, y: number ): Promise<any> | void;
    getAverageColor( x_start?: number, y_start?: number, width?: number, height?: number ): RGB | Promise<RGB>;
    getWidth(): number;
    getHeight(): number;
    getAspectRatio(): number;

}