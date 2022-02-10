import {findBlockBetween, findAngle, spawnProjectile, getPlayerPosition, Vector2} from "../../Utils.js";
import LivingEntity from "../LivingEntity.js";
import Projectile from "../projectiles/Projectile.js";

class Enemy extends LivingEntity {
    constructor(posX, posY){
        super(posX, posY);
        this.setHealth(5);
        this.setHitbox(0.75, 0.75);
        this._colour = "rgba(255, 0, 0, 1)";
        this._cooldown = 50;
        this._faction = "Hostile";
    }
    changeAngle(){
        this._angle = findAngle(this._position, getPlayerPosition());
    }
    canSeePlayer(){
        // findBlockFromRay returns the block the ray hits, if it hits nothing it means it has a direct line of sight to the player
        return findBlockBetween(this._position, getPlayerPosition()).Coordinates == null;
    }
    getDirectionToPlayer(){
        return Vector2.subtract(this._position, getPlayerPosition()).normalize();
    }
    update(){
        this.changeAngle();
        if(this.canSeePlayer()){
            if(this._cooldown <= 0){
                let rayDirection = this.getDirectionToPlayer();
                spawnProjectile(new Projectile(this._position, rayDirection, "Friendly", 1.2));
                this._cooldown = 25;
            }
        }
        super.update();
    }
}

export default Enemy;