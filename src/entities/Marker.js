import Entity from "./Entity.js";
// Basic marker for testing purposes
class Marker extends Entity{
    constructor(posX, posY, colour = "blue"){
        super(posX, posY);
        this.setHitbox(0.4, 0.4);
        this._colour = colour;
    }
    update(){
        // Do nothing
    }
}

export default Marker;