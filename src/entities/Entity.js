import {Vector2} from "../Utils.js";

class Entity {
    constructor(posX, posY){
        this.setHitbox(0.1, 0.1);
        this._position = new Vector2(posX, posY);
        this._angle = 0;   
        this._removed = false;
        this._colour = "rgba(255, 255, 255, 1)";
        this._cooldown = 0; // Used for character firing reloading or projectile timeout      
    }
    update(){
        // Projectile's update methods can return the entity the projectile hit as well as null/true/false.
        if(this._removed) return;
        if(this._cooldown > 0) this._cooldown--;
    }
    setHitbox(x, y){
        this._hitbox = new Vector2(x, y);
        this._hitboxHalf = new Vector2(x / 2, y / 2);
    }
    get position(){
        return this._position;
    }
    get hitboxHalf(){
        return this._hitboxHalf;
    }
    get hitbox(){
        return this._hitbox;
    }
    get angle(){
        return this._angle;
    }
    get colour(){ // Adds the opacity to the rgba colour string depending on if the entity is being hit.
        return this._colour;
    }
    get removed(){
        return this._removed;
    }
    set position(pos){
        this._position = pos;
    }
}

export default Entity;