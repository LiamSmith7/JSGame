import Line from "./Line.js";

class Laser extends Line {
    constructor(pos1, pos2){
        super(pos1, pos2);
        this._width = 4;
        this._lifeTime = 20;
        this._colour = "rgba(255, 255, 0, 1)";
        this._opacity = 1;
    }
    update(){
        this._opacity -= 0.05;
        this._colour = "rgba(255, 255, 0, " + this._opacity + ")";
        this._width -= 0.2;
        super.update();
    }
}

export default Laser;