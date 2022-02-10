import {findBlockFromRay, findEntityFromRay, findAngleFromUnitVector} from "../../Utils.js";
import Entity from "../Entity.js";

class Projectile extends Entity {
    constructor(startPoint, rayVector, desiredTarget, speed){
        super(startPoint.X, startPoint.Y);
        this._colour = "yellow";
        this.setHitbox(0.2, 0.2);
        this._speed = speed;

        this._direction = rayVector.normalize();
        this._desiredTarget = desiredTarget;
        this._cooldown = 125;
        this.getAngleFromDirection();

        this._oldPositions = [startPoint];
    }
    getAngleFromDirection(){
        this._angle = findAngleFromUnitVector(this._direction);
    }
    update(){
        this._oldPositions = [this._position];
        super.update();
        if(this._cooldown <= 0) this._removed = true;
        // Starting from current position, cast a ray facing this._direction. Find block, then find entity
        let rayVector = this._direction.multiply(this._speed);
        let blockResult = findBlockFromRay(this._position, rayVector, true);
        //{Coordinates, HitPos, Side}
        let entityResult = findEntityFromRay(this._position, blockResult.HitPos, this._desiredTarget);
        this._position = entityResult.HitPos;
        
        if(entityResult.Entity != null){
            entityResult.Entity.damage(this._damage);
            this._removed = true;
            return entityResult.Side;
        }
        else if(blockResult.Coordinates != null){
            this._removed = true;
            return blockResult.Side;
        } 
    }
    get position(){
        return this._position;
    }
    get angle(){
        return this._angle;
    }
    get oldPositions(){
        return this._oldPositions;
    }
}

export default Projectile;