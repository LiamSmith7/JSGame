import {Vector2, pathfind, spawnProjectile, getPlayerPosition} from "../../Utils.js";
import Enemy from "./Enemy.js";
import Projectile from "../projectiles/Projectile.js";

class PathfindingEnemy extends Enemy {
    constructor(posX, posY){
        super(posX, posY);
        this._colour = "purple";
        this._path = null;
        this._pathIndex = 0;
        this._pathCooldown = 25;
    }
    update(){
        this.changeAngle();
        this._pathCooldown--;
        if(this.canSeePlayer()){
            this._momentum = Vector2.zero;
            if(this._cooldown <= 0){
                let rayDirection = this.getDirectionToPlayer();
                spawnProjectile(new Projectile(this._position, rayDirection, "Friendly", 1.2));
                this._cooldown = 25;
            }
        }
        else{
            if(this._pathCooldown <= 0 || this._path == null){ // Refresh path;
                let path = pathfind(this._position, getPlayerPosition());
                if(path != null){
                    this._path = path;
                    this._pathIndex = path.length - 1;
                    this._pathCooldown = 25;
                }
            }
            else{
                let direction = null;
                let foundNextSpot = false;
    
                do{
                    let newSpot = Vector2.add(this._path[this._pathIndex], new Vector2(0.5, 0.5))
                    direction = Vector2.subtract(this._position, newSpot);
                    if(direction.magnitude < 0.1){
                        this._pathIndex--;
                    }
                    else{
                        foundNextSpot = true;
                    }
                } while (!foundNextSpot)
    
                this._momentum = direction.normalize().multiply(0.1);
            }
        }
        super.update();
    }
}

export default PathfindingEnemy;