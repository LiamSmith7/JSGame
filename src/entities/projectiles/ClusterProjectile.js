import { Vector2, findUnitVectorFromAngle, spawnProjectile } from "../../Utils.js";
import BouncingProjectile from "./BouncingProjectile.js";
import MiniBouncingProjectile from "./MiniBouncingProjectile.js";

const CLUSTER_VARIATION = 0.2;
const CLUSTER_VARIATION_2 = CLUSTER_VARIATION * 2;
class ClusterProjectile extends BouncingProjectile {
    constructor(shotFrom, shotTo, desiredTarget, speed){
        super(shotFrom, shotTo, desiredTarget, speed);
        this.setHitbox(0.3, 0.3);
        this._cooldown = 25;
        this._damage = 2;
        this._bounceTimes = 10;
    }
    createNewCluster(m){
        spawnProjectile(new MiniBouncingProjectile(this._position, new Vector2(
            m.X,
            m.Y,
        ), this._desiredTarget)); 
    }
    update(){
        let hit = super.update();
        if (hit == true)
            this._momentum.X = -this._momentum.X;
        else if(hit == false) 
            this._momentum.Y = -this._momentum.Y;

        if (this._removed){
            this.createNewCluster(findUnitVectorFromAngle(this._angle + CLUSTER_VARIATION_2));
            this.createNewCluster(findUnitVectorFromAngle(this._angle + CLUSTER_VARIATION));
            this.createNewCluster(findUnitVectorFromAngle(this._angle));
            this.createNewCluster(findUnitVectorFromAngle(this._angle - CLUSTER_VARIATION));
            this.createNewCluster(findUnitVectorFromAngle(this._angle - CLUSTER_VARIATION_2));
        }
    }
}

export default ClusterProjectile;