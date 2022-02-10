import Enemy from "./Enemy.js";
import BouncingProjectile from "../projectiles/BouncingProjectile.js"
import {spawnProjectile} from "../../Utils.js";

class LargeEnemy extends Enemy{
    constructor(posX, posY){
        super(posX, posY);
        this.setHealth(10);
        this._colour = "rgba(150, 0, 0, 1)";
        this._cooldown = 50;
        this.setHitbox(1, 1);
    }
    update(){
        this.changeAngle();
        if(this.canSeePlayer()){
            if(this._cooldown <= 0){
                let rayDirection = this.getDirectionToPlayer();
                spawnProjectile(new BouncingProjectile(this._position, rayDirection, "Friendly", 2));
                this._cooldown = 50;
            }
        }
        super.update();
    }
}

export default LargeEnemy;