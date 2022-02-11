import { Vector2 } from "../../Utils.js";
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
    get playerSpawn() {return new Vector2(this._offsetX, this._offsetY);}
    get layout() {return this._layoutManager.layout;}
    /**
     * Converts the coordinates of the level to the coordinates of the world.
     * @param {*} x X coordinate of the level
     * @param {*} y Y coordinate of the level
     * @returns {[float, float]} Coordinates of the world
     */
    summon(){
        return [];
    }
}

export default DefaultLevel;