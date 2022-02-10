import LayoutManager from "../LayoutManager.js";

class DefaultLevel {
    constructor(offsetX, offsetY){
        this._offsetX = offsetX;
        this._offsetY = offsetY;

        // Construct layout
        this._layoutManager = new LayoutManager();
        this._layoutManager.placeHorizontal(10, 10, 30, 1);
        this._layoutManager.placeHorizontal(30, 10, 30, 1);
        this._layoutManager.placeVertical(10, 10, 30, 1);
        this._layoutManager.placeVertical(30, 10, 30, 1);
    }
    // Gets
    get offsetX() {return this._offsetX;}
    get offsetY() {return this._offsetY;}
    get layout() {return this._layoutManager.layout;}
    /**
     * Converts the coordinates of the level to the coordinates of the world.
     * @param {*} x X coordinate of the level
     * @param {*} y Y coordinate of the level
     * @returns {[float, float]} Coordinates of the world
     */
    convert(x, y) {return [x + this._offsetX, y + this._offsetY];}
    summon(){
        return [];
    }
}

export default DefaultLevel;