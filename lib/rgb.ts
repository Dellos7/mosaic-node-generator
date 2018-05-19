export class RGB {
    r: number;
    g: number;
    b: number;

    constructor( r: number, g: number, b: number ) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    /**
     * Calculates the euclidean color distance with another color https://en.wikipedia.org/wiki/Color_difference
     * @param rgb 
     */
    getColorDistance( rgb: RGB ) {
        let diff_r = rgb.r - this.r;
        let diff_g = rgb.g - this.g;
        let diff_b = rgb.b - this.b;

        let distance = Math.sqrt(diff_r * diff_r + diff_g * diff_g + diff_b * diff_b);
        return distance;
    }
}