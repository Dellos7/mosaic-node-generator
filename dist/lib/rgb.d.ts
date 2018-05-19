export declare class RGB {
    r: number;
    g: number;
    b: number;
    constructor(r: number, g: number, b: number);
    /**
     * Calculates the euclidean color distance with another color https://en.wikipedia.org/wiki/Color_difference
     * @param rgb
     */
    getColorDistance(rgb: RGB): number;
}
