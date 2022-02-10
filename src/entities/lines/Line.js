class Line{
    constructor(pos1, pos2){
        this._pos1 = pos1;
        this._pos2 = pos2;
        this._width = 2;
        this._colour = "yellow";
        this._lifeTime = 25;
        this._removed = false;
    }
    get pos1(){
        return this._pos1;
    }
    get pos2(){
        return this._pos2;
    }
    get colour(){
        return this._colour;
    }
    get thickness(){
        return this._width;
    }
    get lifeTime(){
        return this._lifeTime;
    }
    get removed(){
        return this._removed;
    }
    update(){
        this._lifeTime--;
        if(this._lifeTime <= 0)
            this._removed = true;
    }
}

export default Line;