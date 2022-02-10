import BouncingProjectile from "./BouncingProjectile.js";

class MiniBouncingProjectile extends BouncingProjectile {
    constructor(shotFrom, shotTo, desiredTarget){
        super(shotFrom, shotTo, desiredTarget, 0.4);
        this.setHitbox(0.2, 0.2);
        this._bounceTimes = 3;
        this._damage = 1;
        this._cooldown = 50;
    }
}

export default MiniBouncingProjectile;