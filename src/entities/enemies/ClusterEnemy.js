import Enemy from "./Enemy.js";
import ClusterProjectile from "../projectiles/ClusterProjectile.js";
import { spawnProjectile } from "../../Utils.js";

class ClusterEnemy extends Enemy{
    constructor(posX, posY){
        super(posX, posY);
        this.setHealth(5);
        this._colour = "rgba(200, 100, 0, 1)";
        this._cooldown = 30;
    }
    update(){
        this.changeAngle();
        if(this.canSeePlayer()){
            if(this._cooldown <= 0){
                let rayDirection = this.getDirectionToPlayer();
                spawnProjectile(new ClusterProjectile(this._position, rayDirection, "Friendly", 1));
                this._cooldown = 50;
            }
        }
        super.update();
    }
}

export default ClusterEnemy;