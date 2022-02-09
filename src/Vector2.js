 class Vector2{
    constructor(X, Y){
        this._x = X;
        this._y = Y;
        this._magnitude = Vector2.calculateMagnitude(this);
    }
    get X() {
        return this._x;
    }
    get Y() {
        return this._y;
    }
    set X(x) {
        this._x = x;
        this._magnitude = Vector2.calculateMagnitude(this);
    }
    set Y(y) {
        this._y = y;
        this._magnitude = Vector2.calculateMagnitude(this);
    }
    get magnitude(){
        return this._magnitude;
    }
    normalize(){ // Return a normalized copy of the current vector
        if(this._magnitude != 0){
            return new Vector2(this._x / this._magnitude, this._y / this._magnitude);
        }
        return this;
    }
    multiply(number){ // Returns a multiplied copy of the current vector
        return new Vector2(this._x * number, this._y * number);
    }
    static calculateMagnitude(vector2){
        return Math.sqrt((vector2.X * vector2.X) + (vector2.Y * vector2.Y));
    }
    static subtract(firstVector2, secondVector2){
        return new Vector2(secondVector2.X - firstVector2.X, secondVector2.Y - firstVector2.Y);
    }
    static add(firstVector2, secondVector2){
        return new Vector2(firstVector2.X + secondVector2.X , firstVector2.Y + secondVector2.Y);
    }
    static get zero(){
        return ZERO;
    }
    toString(){
        return "{ " + this._x + ", " + this._y + " }";
    }
}
const ZERO = new Vector2(0, 0);

export default Vector2;