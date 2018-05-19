import { Image } from './image';
import { RGB } from './rgb';
export declare class MosaicImage {
    image: Image;
    tilesDirectory: string;
    cellWidth: number;
    cellHeight: number;
    columns: number;
    rows: number;
    tiles: Image[];
    tilesIndexMatrix: number[][];
    thumbsDirectoryFromRead: string | null;
    thumbsDirectoryToWrite: string | null;
    enableConsoleLogging: boolean;
    constructor(image: Image, tilesDirectory?: string, cellWidth?: number, cellHeight?: number, columns?: number, rows?: number, thumbsDirectoryFromRead?: string, thumbsDirectoryToWrite?: string, enableConsoleLogging?: boolean);
    /**
     * Recalculate columns and rows depending on the aspect ratio of the image
     * Resize the final image depending on the cell width and height, rows, columns...
     */
    private _prepare();
    /**
     * Helps calculate progress percentajes
     * @param currentRow
     * @param totalRows
     */
    private _calcProgress(current, total);
    /**
     * Basically reads all the tiles (pictures) from a folder, parses them as 'Image' objects and stores in the 'tiles' attribute
     * @param tilesDirectory
     */
    private _readTiles(tilesDirectory?);
    /**
     * If attribute 'thumbsDirectoryFromRead' is true, it reads tiles as thumbs from the given thumbs folder
     * It does not resize them as they are supposed to be already thumbnails
     */
    private _readThumbs();
    /**
     * Saves the tiles in the 'thumbsDirectoryToWrite' folder, so we can use them later in order to save time
     */
    generateThumbs(): void;
    /**
     * Decides to read the tiles or read the thumbnails
     * @param tilesDirectory
     */
    readTiles(tilesDirectory?: string): Promise<Image[]>;
    /**
     * This is the core function. For each cell (row,col) of the image, it calculates the average color of that zone
     * Then, it calculates the best tile that suits in that zone calculating the difference within all the tiles
     * When we know which tile we will use for that zone, we "paste" that tile in our output image, in the appropiate coords
     * @param rowStart
     * @param colStart
     * @param numRows
     * @param numCols
     */
    processRowsAndColumns(rowStart: number, colStart: number, numRows: number, numCols: number): Promise<any>;
    /**
     * Calculates the best tile for the given RGB colour. It compares the given rgb colour with all the tiles and decides which one is more suitable
     * The algorithm also tries to prevent the use of the same thumb in a too close area
     * @param imageAvgColor
     * @param row
     * @param col
     */
    getBestTileForImage(imageAvgColor: RGB, row: number, col: number): Promise<Image>;
    /**
     * 1. Read the tiles from disk
     * 2. Process the image (calculate the tiles for each cell in the image)
     * 3. Save the image in disk
     */
    generate(): Promise<any>;
}
