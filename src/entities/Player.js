import LivingEntity from "./LivingEntity.js";
import {Vector2, findAngle, spawnProjectile, spawnLine, getRayDirection, findBlockFromRay, findEntityFromRay} from "../Utils.js";
import Projectile from "./projectiles/Projectile.js";
import Laser from "./lines/Laser.js";

// The character the user controls
class Player extends LivingEntity {
    constructor(posX, posY){
        super(posX, posY);
        this.setHitbox(0.75, 0.75);
        this._momentum = new Vector2(0, 0);
        this.setHealth(10);
        this._colour = "rgba(0, 200, 0, 1)";
        this._laserCooldown = 0;
        this._faction = "Friendly"

        // Player controls
        this._movement = [0, 0, 0, 0]; // 0 = up, 1 = down, 2 = left, 3 = right
        this._mouseWorldPos = new Vector2(0, 0);
        this._firingProjectiles = false;
        this._firingLasers = false;
    }
    updateMovement(newMovement){
        this._movement = newMovement;
    }
    updateMouseWorldPos(newMouseWorldPos){
        this._mouseWorldPos = newMouseWorldPos;
    }
    updateFiringProjectiles(value){
        this._firingProjectiles = value;
    }
    updateFiringLaser(value){
        this._firingLasers = value;
    }
    update(){
        this._momentum = new Vector2((this._movement[2] - this._movement[3]) / 5, (this._movement[1] - this._movement[0]) / 5);
        this._angle = findAngle(this._position, this._mouseWorldPos);
        if(this._laserCooldown > 0) this._laserCooldown--;
        super.update();

        if(this._firingProjectiles && this._cooldown == 0){
            this._cooldown = 5;
            spawnProjectile(new Projectile(this._position, getRayDirection(this._position, this._mouseWorldPos), "Hostile", 0.5));
        }
        if(this._firingLasers && this._laserCooldown == 0){
            this._laserCooldown = 50;
            let rayVector = getRayDirection(this._position, this._mouseWorldPos).normalize().multiply(100);
            let result = findBlockFromRay(this._position, rayVector);
            let closest = findEntityFromRay(this._position, result.HitPos, "Hostile");
            if(closest.Entity != null){
                spawnLine(new Laser(this._position, closest.HitPos));
                closest.Entity.damage(3);
            }
            else{
                spawnLine(new Laser(this._position, result.HitPos));
            }
        }
    }
}

export default Player;