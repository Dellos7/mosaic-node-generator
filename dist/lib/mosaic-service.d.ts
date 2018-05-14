export declare class MosaicService {
    private default_cell_width;
    private default_cell_height;
    private default_columns;
    private default_rows;
    private default_final_image_name;
    private default_tiles_dir;
    image: Jimp.Jimp;
    image_width: number;
    image_height: number;
    cell_width: number;
    cell_height: number;
    rows: number;
    columns: number;
    aspect_ratio: number;
    final_image_name: string;
    tiles_dir: string;
    tiles: Jimp.Jimp[];
    constructor(image: Jimp.Jimp, tiles_dir?: string, final_image_name?: string, cell_width?: number, cell_height?: number, columns?: number, rows?: number);
    private _prepare();
    readTiles(tilesDir?: string): Promise<Jimp.Jimp[]>;
    save(imageName?: string): void;
}
