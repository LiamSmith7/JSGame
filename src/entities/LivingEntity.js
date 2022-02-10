import MovingEntity from "./MovingEntity.js";

// Entity has HP, healthbars, and factions.
class LivingEntity extends MovingEntity {
    constructor(posX, posY){
        super(posX, posY);
        this.setHealth(0);
        this._isHit = 0;
        this._showHealthbar = 0;
        this._faction = null;
    }
    update(){
        if(this._isHit > 0) this._isHit--;
        if(this._showHealthbar > 0) this._showHealthbar--;
        super.update();
    }
    setHealth(hp){
        this._health = hp;
        this._maxHealth = hp;
    }
    damage(value = 1){
        this._isHit = 4;
        this._health -= value;
        if(this._health <= 0)
            this._removed = true;
        else
            this._showHealthbar = 75;
    }
    get health(){
        return this._health;
    }
    get maxHealth(){
        return this._maxHealth;
    }
    get healthbar(){
        return this._showHealthbar > 0;
    }
    get colour(){
        return this._isHit > 0 ? "rgba(200, 200, 200, 0.1)" : this._colour;
    }
    get faction(){
        return this._faction;
    }
    get immune(){
        return this._isHit > 0;
    }
}

export default LivingEntity;