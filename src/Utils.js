import World from "./World.js";
// ============================================================================================================================================= //
//   World
// ============================================================================================================================================= //

let world = null;
/**
 * Sets the world that raycasting, projectile, and summoning functions work.
 * @param {World} newWorld 
 */
const setWorld = function(newWorld) {world = newWorld;}

const spawnProjectile = function(projectile) {world.spawnProjectile(projectile);}
const spawnLine = function(line) {world.spawnLine(line);}
const getPlayerPosition = function(position) {return world.player.position;}

// ============================================================================================================================================= //
//   Vector2 
// ============================================================================================================================================= //

class Vector2{
    constructor(X = 1, Y = 1){
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

// ============================================================================================================================================= //
//   Misc.
// ============================================================================================================================================= //

const HALFPI = Math.PI / 2;

function round(num, to = 1000){
    return (Math.round(num * to) / to);
}

function findAngleFromUnitVector(unitVector){
    return HALFPI + (unitVector.X < 0 ? Math.acos(unitVector.Y) : -Math.acos(unitVector.Y));
}

function findAngle(pos1, pos2){
    return findAngleFromUnitVector(Vector2.subtract(pos1, pos2).normalize());
}

function findUnitVectorFromAngle(angle){
    return new Vector2(-Math.sin(angle - HALFPI), Math.cos(angle - HALFPI));
}

function readWorld(x, y){
    return world.read(x, y);
}


// ============================================================================================================================================= //
//   Raycasting (Entities and World)
// ============================================================================================================================================= //

/**
 * Returns an Object containing the Block coordinates and the exact hit position.
 * If the Block coordinates are null, no block was found.
 *
 * @param {Vector2} start The origin of the raycast
 * @param {Vector2} rayVector The ray's direction
 * @returns {{ Coordinates: Vector2; HitPos: Vector2; Side: boolean}} Coordinates = World coordinates (Nullable), HitPos = Exact location, Side = Side of entity hit (true = Horizontal side, false = Vertical side, null = Nothing hit)
 */
 function findBlockFromRay(start, rayVector, test = false){
    /*
    Divide both X and Y by X and Y
    {50, 25}
    yRatio = 25 / 50 = 0.5s
    xRatio = 50 / 25 = 2

    Iterate through X:
    Find which Y is at X
    Y = startY + (yRatio * X)
    Check +X and -X

    Iterate through Y
    Find which X is at Y
    X = startX + (xRatio * Y)
    Check +Y and -Y
    */

    // Line equation
    let xRatio = rayVector.X / rayVector.Y;
    let yRatio = rayVector.Y / rayVector.X;
    // Which direction the for loop travels
    let xDirection = rayVector.X >= 0 ? 1: -1;
    let yDirection = rayVector.Y >= 0 ? 1: -1;
    
    // Gets the offset of the X and Y coordinates of the start position away from the grid
    let roundingX = start.X - Math.floor(start.X);
    let roundingY = start.Y - Math.floor(start.Y);
    // Aligning the start positions to the grid. Starting from 0 or 1 depending on which way the ray is facing.
    // If the coordinates are already on the grid, no rounding needs to take place.
    // Otherwise, take away the offset away from the start position to get the starting coordinates aligned to the grid.
    let startX = xDirection + (roundingX == 0 ? 0 : (xDirection == 1 ? 0 : 1) - roundingX);
    let startY = yDirection + (roundingY == 0 ? 0 : (yDirection == 1 ? 0 : 1) - roundingY);

    // {Coordinates, HitPos}
    let finish = Vector2.add(start, rayVector);
    let closestX = {Coordinates: null, HitPos: finish, Side: null};
    let closestY = {Coordinates: null, HitPos: finish, Side: null};

    // Since it checks from the start point, any further results after the first don't matter.
    for(let x = startX; Math.abs(x) <= Math.abs(rayVector.X); x += xDirection){
        let xOffset = start.X + x;
        let yOffset = start.Y + (yRatio * x);
        let readX = Math.floor(xOffset);
        let readY = Math.floor(yOffset);
        if(readWorld(readX, readY)){    
            closestX = {Coordinates: new Vector2(readX, readY), HitPos: new Vector2(xOffset, yOffset), Side: false};
            break;
        }
        else if(readWorld(readX - 1, readY)){
            closestX = {Coordinates: new Vector2(readX - 1, readY), HitPos: new Vector2(xOffset, yOffset), Side: false};
            break;
        }
    }

    for(let y = startY; Math.abs(y) <= Math.abs(rayVector.Y); y += yDirection){
        let xOffset = start.X + (xRatio * y);
        let yOffset = start.Y + y;
        let readX = Math.floor(xOffset);
        let readY = Math.floor(yOffset);
        if(readWorld(readX, readY)){
            closestY = {Coordinates: new Vector2(readX, readY), HitPos: new Vector2(xOffset, yOffset), Side: true};
            break;
        }
        else if(readWorld(readX, readY - 1)){
            closestY = {Coordinates: new Vector2(readX, readY - 1), HitPos: new Vector2(xOffset, yOffset), Side: true};
            break;
        }
    }

    let xDist = Vector2.subtract(closestX.HitPos, start).magnitude;
    let yDist = Vector2.subtract(closestY.HitPos, start).magnitude;

    // Checks the magnitude of the two found points and returns the one closest to the start
    if(xDist < yDist)
        return closestX;
    else
        return closestY;
}

/**
 * Returns an Object containing the Block coordinates and the exact hit position.
 * If the Block coordinates are null, no block was found.
 *
 * @param {Vector2} start The origin of the raycast
 * @param {Vector2} finish The raycast's end point
 * @returns {{ Coordinates: Vector2; HitPos: Vector2; Side: boolean}} Coordinates = World coordinates (Nullable), HitPos = Exact location, Side = Side of entity hit (true = Horizontal side, false = Vertical side, null = Nothing hit)
 */
function findBlockBetween(start, finish){
    return findBlockFromRay(start, Vector2.subtract(start, finish));
}

/**
 * Returns a Vector2 representing a ray between the start and finish positions.
 *
 * @param {Vector2} start The origin of the ray
 * @param {Vector2} finish Where the way should end
 * @returns {Vector2} Ray's direction
 */
function getRayDirection(start, finish){
    return Vector2.subtract(start, finish)
}

/**
 * Returns an Object containing an entity and the exact hit position.
 * If the Entity is null, no entity was found.
 *
 * @param {Vector2} start The origin of the raycast
 * @param {Vector2} finish The raycast's end point
 * @param {String} faction What kind of entity the raycast should attempt to find (E.g. "Hostile" or "Friendly") 
 * @returns {{ Entity: Entity; HitPos: Vector2; Side: boolean}} Entity = Hit entity (Nullable), HitPos = Exact location, Side = Side of entity hit (true = Horizontal side, false = Vertical side, null = Nothing hit)
 */
function findEntityFromRay(start, finish, faction){
    let rayVector = Vector2.subtract(start, finish);
    let yRatio = rayVector.Y / rayVector.X;
    let hitPoints = [];

    // Calculates the bounds of the ray so it doesn't find anything outside of ray's path.
    let upperBound = new Vector2(Math.max(start.X, finish.X), Math.max(start.Y, finish.Y));
    let lowerBound = new Vector2(Math.min(start.X, finish.X), Math.min(start.Y, finish.Y));

    world.entities.forEach(entity => {
        if((find == null || entity.faction == faction) && !entity.immune){
            let topLeft = Vector2.subtract(entity.hitboxHalf, entity.position);
            let bottomRight = Vector2.add(entity.position, entity.hitboxHalf);
            let coordinate = 0;
            // Check Top and Bottom bounds
            // y = mx + c
            // y - c = mx
            // (y - c) / m = x
            // fX = sX + ((fY - sY) / yRatio)

            if(topLeft.Y < upperBound.Y && topLeft.Y > lowerBound.Y){
                coordinate = start.X + ((topLeft.Y - start.Y) / yRatio);
                if(coordinate >= topLeft.X && coordinate <= bottomRight.X){
                    hitPoints.push({Entity: entity, HitPos: new Vector2(coordinate, topLeft.Y), Side: true});
                }
            }

            if(bottomRight.Y < upperBound.Y && bottomRight.Y > lowerBound.Y){
                coordinate = start.X + ((bottomRight.Y - start.Y) / yRatio);
                if(coordinate >= topLeft.X && coordinate <= bottomRight.X){
                    hitPoints.push({Entity: entity, HitPos: new Vector2(coordinate, bottomRight.Y), Side: true});
                }
            }

            // Check Left and Right bounds
            // fX = sX + ((fY - sY) / yRatio)
            // fX - sX = (fY - sY) / yRatio
            // (fX - sX) * yRatio = fY - sY
            // fY = sY + ((fx - sX) * yRatio)
            if(topLeft.X < upperBound.X && topLeft.X > lowerBound.X){
                coordinate = start.Y + ((topLeft.X - start.X) * yRatio);
                if(coordinate >= topLeft.Y && coordinate <= bottomRight.Y){
                    hitPoints.push({Entity: entity, HitPos: new Vector2(topLeft.X, coordinate), Side: false});
                }
            }

            if(bottomRight.X < upperBound.X && bottomRight.X > lowerBound.X){
                coordinate = start.Y + ((bottomRight.X - start.X) * yRatio);
                if(coordinate >= topLeft.Y && coordinate <= bottomRight.Y){
                    hitPoints.push({Entity: entity, HitPos: new Vector2(bottomRight.X, coordinate), Side: false});
                }
            }
            
        }
    });

    // {Entity, Vector2}
    let closest = {Entity: null, HitPos: finish, Side: null};
    // Nothing was hit, 
    if(hitPoints.length == 0) {
        return closest;
    }

    let closestMagnitude = rayVector.magnitude;
    hitPoints.forEach(element => {
        let checkingMagnitude = Vector2.subtract(start, element.HitPos).magnitude;
        if(checkingMagnitude < closestMagnitude){
            closestMagnitude = checkingMagnitude;
            closest = element;
        }
    });

    return closest;
}

// ============================================================================================================================================= //
//   Pathfinding
// ============================================================================================================================================= //

const pX = new Vector2(1, 0);
const nX = new Vector2(-1, 0);
const pY = new Vector2(0, 1);
const nY = new Vector2(0, -1);

/**
 * A class which contains the path as an array (if found).
 *
 * @param {Vector2} startPos The path's start point.
 * @param {Vector2} finishPos The path's end point.
 * @returns {[Vector2]} Array of the path (null if not found).
 */
function pathfind(startPos, finishPos){
    // Keeps track of what paths are going where
    let pathMap = [];

    const record = (position, origin) => {
        if(pathMap[position.X] == null) pathMap[position.X] = []; // If no Y array exists at column X, add it
        // The final 2 world.read function calls only make a difference if a diagonal movement is being recorded.
        if(pathMap[position.X][position.Y] == null && !world.read(position.X, position.Y) && !world.read(position.X, origin.Y) && !world.read(origin.X, position.Y)){
            pathMap[position.X][position.Y] = origin;
            return true;
        }
        return false;     
    }

    const search = (searching, origin) => {
        if(record(searching, origin)) newSearchingPositions.push(searching);
    }

    // Setup
    startPos = new Vector2(Math.floor(startPos.X), Math.floor(startPos.Y));
    finishPos = new Vector2(Math.floor(finishPos.X), Math.floor(finishPos.Y));
    record(startPos, startPos)

    let searchingPositions = [startPos];
    let newSearchingPositions = [];

    let found = null; // What position has reached the finish point
    let running = true; // Remains true if there are spaces to search
    let searching = null; // Temporary variable to search/record paths
    let timeout = 100; // Maximum distance to search

    while(running){
        timeout--;
        searchingPositions.forEach(origin => {
            // Look +X
            search(Vector2.add(origin, pX), origin);
            // Look -X
            search(Vector2.add(origin, nX), origin);
            // Look +Y
            search(Vector2.add(origin, pY), origin);
            // Look -Y
            search(Vector2.add(origin, nY), origin);
            
            // Look +X +Y
            search(Vector2.add(Vector2.add(origin, pX), pY), origin);
            // Look +X -Y
            search(Vector2.add(Vector2.add(origin, pX), nY), origin);
            // Look -X +Y
            search(Vector2.add(Vector2.add(origin, nX), pY), origin);
            // Look -X -Y
            search(Vector2.add(Vector2.add(origin, nX), nY), origin);
        });
        if(newSearchingPositions.length == 0 || timeout == 0){
            running = false;
        }
        else{
            newSearchingPositions.forEach(newPosition => {
                if(newPosition.X == finishPos.X && newPosition.Y == finishPos.Y){
                    found = newPosition;
                    running = false;
                }
            });
            if(!found){
                // Creates a copy of the newSearchingPositions array for the next run
                searchingPositions = [...newSearchingPositions]; 
                newSearchingPositions.length = 0;
            }
        }
    }

    // Working backwards to find the path to the start
    const read = (position) => {return pathMap[position.X][position.Y];}
    if(found != null){  
        let path = [];
        let track = finishPos;
        searching = finishPos;
        do{      
            path.push(searching);    
            searching = track;
            track = read(searching);   
        } while (!(track.X == searching.X && track.Y == searching.Y))
        return path;   
    }
    return null;
}

export {
    Vector2, 
    setWorld, 
    round,
    findUnitVectorFromAngle,
    findAngleFromUnitVector,
    findAngle,
    findBlockFromRay,
    findBlockBetween,
    getRayDirection,
    findEntityFromRay,
    pathfind,
    readWorld,
    spawnProjectile,
    spawnLine,
    getPlayerPosition
};