import Projectile from "./Projectile.js";

class BouncingProjectile extends Projectile {
    constructor(startPoint, rayDirection, desiredTarget, speed){
        super(startPoint, rayDirection, desiredTarget, speed);
        this._cooldown = 200;
        this._bounceTimes = 5;
        this._damage = 2;
        console.log("FIRED");
    }
    update(){
        let hit = super.update();   

        if(this._removed && this._bounceTimes > 0 && hit != null){
            this._bounceTimes--;
            this._removed = false;

            if(hit == true) // Bounce vertically
                this._direction.Y = -this._direction.Y;
            else // Bounce horizontally
                this._direction.X = -this._direction.X;
            this.getAngleFromDirection();      
        }
    }
}

export default BouncingProjectile;