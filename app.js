// ============================================================================================================================================= //
//   GENERAL VARIABLES AND FUNCTIONS
// ============================================================================================================================================= //

const game = document.getElementById("game");
let paused = true;

let world = [];
let entities = [];
let projectiles = [];

const HALFPI = Math.PI / 2;
const TAU = Math.PI * 2;

let movement = [0, 0, 0, 0]; // 0 = up, 1 = down, 2 = left, 3 = right
let mousePos = {X: 0, Y: 0};
let player = null;
let firing = false;

function togglePause(){
    paused = !paused;
}

function round(num)
{
    return (Math.round(num * 1000) / 1000) + 0.0;
}

// ============================================================================================================================================= //
//   2D MATHS
// ============================================================================================================================================= //

function getVector(pos1, pos2){
    return {
        X: pos2.X - pos1.X,
        Y: pos2.Y - pos1.Y
    };
}

function getMagnitude(vector){
    // Find the magnitude (distance travelled between the two points)
    // a^2 + b^2 = c^2
    return Math.sqrt((vector.X * vector.X) + (vector.Y * vector.Y));
}

function normalizeVector(vector){
    // Normalize to turn into a unit vector (length of 1 with same angle)
    // Divide by the magnitude
    let magnitude = getMagnitude(vector);
    return {
        X: vector.X / magnitude,
        Y: vector.Y / magnitude
    }
}

function findAngleFromUnitVector(unitVector){
    return HALFPI + (unitVector.X < 0 ? Math.acos(unitVector.Y) : -Math.acos(unitVector.Y));
}

function findAngle(pos1, pos2){
    return findAngleFromUnitVector(normalizeVector(getVector(pos1, pos2)));
}

function findUnitVectorFromAngle(angle){
    return {X: -Math.sin(angle - HALFPI), Y: Math.cos(angle - HALFPI)}
}

// ============================================================================================================================================= //
//   WORLD
// ============================================================================================================================================= //

function place(x, y, id){
    if(world[x] == null)
        world[x] = [];
    world[x][y] = id;
}

function placeHorizontal(y, x1, x2, id){
    for(let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++){
        place(i, y, id);
    }  
}

function placeVertical(x, y1, y2, id){
    for(let i = Math.min(y1, y2); i <= Math.max(y1, y2); i++){
        place(x, i, id);
    }
}

function placeBox(x1, y1, x2, y2, id){
    for(let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++){
        for(let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++){
            place(x, y, id);
        }
    }
}

function read(x, y){
    if(world[x] == null)
        world[x] = [];
    return world[x][y];
}

function start(){
    paused = false;

    clearInterval(game.interval);

    // Clears the arrays
    entities.length = 0;
    projectiles.length = 0;

    // Outer walls
    placeHorizontal(10, 10, 30, 1);
    placeHorizontal(30, 10, 30, 1);
    placeVertical(10, 10, 30, 1);
    placeVertical(30, 10, 30, 1);

    // Building 1
    placeHorizontal(12, 12, 22, 1);
    placeHorizontal(18, 12, 22, 1);
    placeVertical(12, 12, 18, 1);
    placeVertical(22, 12, 18, 1);

    place(17, 18, null);
    place(14, 14, 1);

    // Building 2
    placeBox(15, 23, 28, 28, 1);
    placeBox(16, 24, 27, 27, null);
    place(21, 23, null);

    // Building 3
    placeBox(24, 13, 28, 20, 1);
    placeBox(26, 13, 26, 20, null);

    // Area2
    placeBox(30, 10, 50, 30, 1);
    placeBox(31, 11, 49, 29, null);
    place(30, 20, null);

    placeHorizontal(22, 37, 47, 1);

    player = new Player(20, 20);
    entities.push(player);

    entities.push(new Enemy(12, 28));
    entities.push(new Enemy(26.8, 25));
    entities.push(new LargeEnemy(21.2, 13.6));
    entities.push(new ClusterEnemy(47, 27));

    game.interval = setInterval(update, 20);
}

// ============================================================================================================================================= //
//   DRAWING
// ============================================================================================================================================= //

let size = 20;
let ctx = game.getContext("2d");


function draw(){

    // World
    for(let x = 0; x < world.length; x++){
        if(world[x] != null){
            for(let y = 0; y < world.length; y++){
                if(world[x][y] == 1){
                    ctx = game.getContext("2d");
                    ctx.fillStyle = "#DDDDDD";
                    ctx.fillRect(x * size, y * size, size, size);
                }
            }
        }
    }

    // Projectiles
    for(const i in projectiles){
        let projectile = projectiles[i];
        let position = projectile.position;
        let hitbox = projectile.hitbox;
        let hitboxHalf = projectile.hitboxHalf;
        ctx.translate(position.X * size, position.Y * size);
        ctx.rotate(projectile.angle);
        ctx.fillStyle = projectile.colour;
        ctx.fillRect(-hitboxHalf.X * size , -hitboxHalf.Y * size, hitbox.X * size, hitbox.Y * size);

        // Reset ctx
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Entities
    for(const i in entities){
        let entity = entities[i];
        let position = entity.position;
        let hitbox = entity.hitbox;
        let hitboxHalf = entity.hitboxHalf;

        // Body
        ctx.fillStyle = entity.colour;
        ctx.fillRect((position.X - hitboxHalf.X) * size , (position.Y - hitboxHalf.Y) * size, hitbox.X * size, hitbox.Y * size);

        // Turrets
        ctx.translate(position.X * size, position.Y * size);
        ctx.rotate(entity.angle);
        ctx.fillStyle = "#777777";
        if(entity instanceof ClusterEnemy){
            ctx.fillRect(-0.1 * size, -0.25 * size, 1 * size, 0.5 * size );
        }
        else{
            ctx.fillRect(-0.1 * size, -0.1 * size, 1 * size, 0.2 * size );
        }

        // Reset ctx
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Instructions
        ctx.font = "20px Arial";
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText("Movement - WASD", 10, 20); 
        ctx.fillText("Fire - Left Click", 10, 40); 
        ctx.fillText("Reset - Space", 10, 60); 
    }
}

// ============================================================================================================================================= //
//   ENTITIES
// ============================================================================================================================================= //

class Entity {
    constructor(posX, posY){
        this.setHitbox(0.75, 0.75);
        this._momentum = {X: 0.0, Y: 0.0};
        this._position = {X: posX, Y: posY};
        this._angle = 0;
        this._health = 0;
        this._removed = false;
        this._colour = "rgba(255, 255, 255, "; // the rest of the rgba string is provided in the get method
        this._cooldown = 0; // Used for character firing reloading or projectile timeout
        this._isHit = 0;
    }
    update(){
        // The update method returns a value based off of what was hit and from what direction.

        // If null, nothing was hit.
        // If true, hit the bottom or top of the wall.
        // If false, hit the left or right of the wall.

        // Projectile's update methods can return the entity the projectile hit as well as null/true/false.

        if(this._removed) return;
        if(this._cooldown > 0) this._cooldown--;
        if(this._isHit > 0) this._isHit--;

        //Vector2 newPosition = Position + Momentum * lastUpdate.Milliseconds;
        // Update entity position
        let newPosition = {
            X: this._position.X + this._momentum.X, 
            Y: this._position.Y + this._momentum.Y
        };

        let oldEntityHitboxTopLeftCorner = {X: this._position.X - this._hitboxHalf.X, Y: this._position.Y - this._hitboxHalf.Y};
        let newEntityHitboxTopLeftCorner = {X: newPosition.X - this._hitboxHalf.X, Y: newPosition.Y - this._hitboxHalf.Y};
        
        //*/
        let overlapTile = {X: 0, Y: 0};
        let overlapCount = 0;
        let edgeCase = false;

        let x = Math.floor(newEntityHitboxTopLeftCorner.X);
        let y = Math.floor(newEntityHitboxTopLeftCorner.Y);
        // console.log("X Range: " + Math.floor(newEntityHitboxTopLeftCorner.X), Math.floor(newEntityHitboxTopLeftCorner.X + this._hitbox.X - 0.0001));
        // console.log("Y Range: " + Math.floor(newEntityHitboxTopLeftCorner.Y), Math.floor(newEntityHitboxTopLeftCorner.Y + this._hitbox.Y - 0.0001));

        // Use do loops instead of for loops
        // To ensure for loops run at least once to ensure collision detection always happens,
        //      I have to use <= in the condition. This means I can inadvertently check the 
        //      world space NEXT TO the block, therefore colliding with something it can't touch
        // The x and y variables cannot change within the loops themselves, or else they'll 
        //      meet the conditions required to stop the loop too early. Therefore the change
        //      has to happen after the condition, but before the next loop.

        // If one total collision happens, one of two things happen:
        // 1: If the entity is moving ONLY vertically OR horizonally, ONLY x OR y will be reset to 0, basic collision.
        // 2: The collision will be resolved in the edge case block further down.

        // hitFace is null if no wall is hit, true if it hits vertically, false if it hits horizontally.
        let hitFace = null;
        do { // Y
            do { // X
                if (read(x, y) == 1)
                {
                    // overlapTile might need to be used for positioning the entity correctly during an edge case.
                    overlapTile = {X: x, Y: y};
                    // overlapCount keeps track of how many obstacles have been hit, used for the edge case code.
                    overlapCount++;
                    
                    // If moving directly vertically.
                    if (x < oldEntityHitboxTopLeftCorner.X + this._hitbox.X && x + 1 > oldEntityHitboxTopLeftCorner.X && this._momentum.Y != 0)
                    {
                        hitFace = true;
                        if (this._momentum.Y > 0)
                            newPosition.Y = y - this._hitboxHalf.Y;
                        else
                            newPosition.Y = y + this._hitboxHalf.Y + 1;
                    }
                    // If moving directly horizontally
                    else if (y < oldEntityHitboxTopLeftCorner.Y + this._hitbox.Y && y + 1 > oldEntityHitboxTopLeftCorner.Y && this._momentum.X != 0)
                    {
                        hitFace = false;
                        if (this._momentum.X > 0)
                            newPosition.X = x - this._hitboxHalf.X;
                        else
                            newPosition.X = x + this._hitboxHalf.X + 1;
                    }
                    else // If moving diagonally over an obstacle, further checks have to be done
                        edgeCase = true;
                }
                // The bottom and right edge of the entity will align with the position of the wall if pressed
                //      against it, so a small number is subtracted to make sure the next wall isnt checked if
                //      pressed up against it. Otherwise, the non-moving entity will "hit" the wall its next to
                //      and run the code above (and in certain circumstances, the edge case code below).
            } while (x++ < Math.floor(newEntityHitboxTopLeftCorner.X + this._hitbox.X - 0.0001));
            x = Math.floor(newEntityHitboxTopLeftCorner.X); // Reset X for the next loop
        } while (y++ < Math.floor(newEntityHitboxTopLeftCorner.Y + this._hitbox.Y - 0.0001));

        // Diagonal moving checks. If MORE than one total collisions happen, the edge case will be resolved since 
        //      the edge case only occurs when approaching the corner of one obstacle diagonally.
        if (edgeCase && overlapCount == 1)
        {
            let travelDistance = {
                X: newEntityHitboxTopLeftCorner.X - oldEntityHitboxTopLeftCorner.X,
                Y: newEntityHitboxTopLeftCorner.Y - oldEntityHitboxTopLeftCorner.Y
            }
            if (Math.abs(travelDistance.X) > Math.abs(travelDistance.Y))
            {
                // More horizontal movement
                hitFace = false;
                if (this._momentum.X > 0)
                    newPosition.X = overlapTile.X - this._hitboxHalf.X;
                else
                    newPosition.X = overlapTile.X + this._hitboxHalf.X + 1;
            }
            else
            {
                // More vertical movement
                hitFace = true;
                if (this._momentum.Y > 0)
                    newPosition.Y = overlapTile.Y - this._hitboxHalf.Y;
                else
                    newPosition.Y = overlapTile.Y + this._hitboxHalf.Y + 1;
            }
        }
        this._position = {X: round(newPosition.X), Y: round(newPosition.Y)};

        // Returns true if entity hit a wall
        return hitFace;
    }
    damage(value = 1){
        this._isHit = 2;
        this._health -= value;
        if(this._health <= 0)
            this._removed = true;
    }
    setHitbox(x, y){
        this._hitbox = {X: x, Y: y};
        this._hitboxHalf = {X: x / 2, Y: y / 2};
    }
    get position(){
        return this._position;
    }
    get hitboxHalf(){
        return this._hitboxHalf;
    }
    get hitbox(){
        return this._hitbox;
    }
    get angle(){
        return this._angle;
    }
    get colour(){ // Adds the opacity to the rgba colour string depending on if the entity is being hit.
        return this._colour + (this._isHit > 0 ? "0.5)" : "1)");
    }
    get removed(){
        return this._removed;
    }
}

class Player extends Entity {
    constructor(posX, posY){
        super(posX, posY);
        this._momentum = {X: 0, Y: 0};
        this._health = 10;
        this._colour = "rgba(0, 200, 0, ";
    }
    update(){
        this._momentum = {
            X: (movement[2] - movement[3]) / 5,
            Y: (movement[1] - movement[0]) / 5
        }
        this._angle = findAngle(this._position, mousePos);

        super.update();

        if(firing && this._cooldown == 0){
            this._cooldown = 5;
            projectiles.push(new Projectile(this, mousePos));
        }
    }
}

class Enemy extends Entity {
    constructor(posX, posY){
        super(posX, posY);
        this._health = 5;
        this._colour = "rgba(255, 0, 0, ";
        this._cooldown = 50;
    }
    changeAngle(){
        this._angle = findAngle(this._position, player.position);
    }
    update(){
        this.changeAngle();
        if(this._cooldown == 0){
            projectiles.push(new Projectile(this, player.position));
            this._cooldown = 25;
        }
        // Pathfind (?)
        // Line of sight (?)
        super.update();
    }
}

class LargeEnemy extends Enemy{
    constructor(posX, posY){
        super(posX, posY);
        this._health = 10;
        this._colour = "rgba(150, 0, 0, ";
        this._cooldown = 50;
        this.setHitbox(1, 1);
    }
    update(){
        this.changeAngle();
        if(this._cooldown == 0){
            projectiles.push(new BouncingProjectile(this, player.position));
            this._cooldown = 50;
        }
        super.update();
    }
}

class ClusterEnemy extends Enemy{
    constructor(posX, posY){
        super(posX, posY);
        this._health = 5;
        this._colour = "rgba(200, 100, 0, ";
        this._cooldown = 30;
    }
    update(){
        this.changeAngle();
        if(this._cooldown == 0){
            projectiles.push(new ClusterProjectile(this, player.position));
            this._cooldown = 50;
        }
        super.update();
    }
}

// ============================================================================================================================================= //
//   PROJECTILES
// ============================================================================================================================================= //
class Projectile extends Entity {
    constructor(shotBy, shotTo, speed = 0.5){
        super(shotBy.position.X, shotBy.position.Y);
        this._originEntity = shotBy;
        this._cooldown = 125;
        this._colour = "rgba(255, 255, 0, ";
        this.setHitbox(0.2, 0.2);
        this._damage = 1;

        let unitVector = normalizeVector(getVector(shotBy.position, shotTo))
        this._momentum = {X: unitVector.X * speed, Y: unitVector.Y * speed};
        this._angle = findAngleFromUnitVector(unitVector);
    }
    getAngleFromMomentum(){
        this._angle = findAngleFromUnitVector(normalizeVector(this._momentum));
    }
    update(){
        if(this._cooldown <= 0){
            this._removed = true;
            return null;
        }

        // Check entity collisions first
        let collided = null;
        for(const entity of entities){
            if(entity != this._originEntity){
                let left = entity.position.X - entity.hitboxHalf.X;
                let right = entity.position.X + entity.hitboxHalf.X;

                let top = entity.position.Y - entity.hitboxHalf.Y;
                let bottom = entity.position.Y + entity.hitboxHalf.Y;

                if(this._position.X <= right && this._position.X >= left && this._position.Y >= top && this._position.Y <= bottom){
                    collided = entity;
                    break;
                }
            }
        }

        // If collided with an entity
        if(collided != null){
            collided.damage(this._damage);
            this._removed = true;
            return collided;
        }
        else{
            // If no collision, do movement and wall collision checks
            let hit = super.update();
            if(hit != null) this._removed = true;
            return hit;
        }
    }
}

class BouncingProjectile extends Projectile {
    constructor(shotBy, shotTo, speed = 0.7){
        super(shotBy, shotTo, speed);
        this.setHitbox(0.4, 0.4);
        this._bounceTimes = 4;
        this._damage = 2;
    }
    update(){
        let hit = super.update();

        if(this._bounceTimes > 0 && (hit == true || hit == false)){
            this._bounceTimes--;
            this._removed = false;  
            if(hit == true){
                // Bounce vertically
                this._momentum.Y = -this._momentum.Y;
            }
            else{
                // Bounce horizontally
                this._momentum.X = -this._momentum.X;
            }
            this.getAngleFromMomentum();
        }
    }
}

class MiniBouncingProjectile extends BouncingProjectile {
    constructor(shotBy, shotTo, shotFrom){
        super(shotBy, shotTo, 0.4);
        this._originEntity = shotFrom;
        this.setHitbox(0.2, 0.2);
        this._bounceTimes = 2;
        this._damage = 1;
        this._cooldown = 50;
    }
}

const CLUSTER_VARIATION = 0.2;
const CLUSTER_VARIATION_2 = CLUSTER_VARIATION * 2;
class ClusterProjectile extends BouncingProjectile {
    constructor(shotBy, shotTo){
        super(shotBy, shotTo, 0.4);
        this.setHitbox(0.3, 0.3);
        this._cooldown = 25;
        this._damage = 2;
        this._bounceTimes = 10;
    }
    createNewCluster(m){
        projectiles.push(new MiniBouncingProjectile(this, {
            X: this._position.X + m.X,
            Y: this._position.Y + m.Y,
        }, this._originEntity)); 
    }
    update(){
        // // this._angle = (this._angle + Math.PI) % TAU; // Tau == 2π
        let hit = super.update();
        
        if (hit == true)
            this._momentum.X = 0 - this._momentum.X;
        else if(hit == false) 
            this._momentum.Y = 0 - this._momentum.Y;

        if (this._removed){
            console.log(hit);
            this.createNewCluster(findUnitVectorFromAngle(this._angle + CLUSTER_VARIATION_2));
            this.createNewCluster(findUnitVectorFromAngle(this._angle + CLUSTER_VARIATION));
            this.createNewCluster(findUnitVectorFromAngle(this._angle));
            this.createNewCluster(findUnitVectorFromAngle(this._angle - CLUSTER_VARIATION));
            this.createNewCluster(findUnitVectorFromAngle(this._angle - CLUSTER_VARIATION_2));
        }
    }
}

// ============================================================================================================================================= //
//   UPDATES
// ============================================================================================================================================= //

// Returns true if the entity/projectile is being removed
function iterate(item){
    item.update();
    return item.removed;
}

function update(e){
    if (paused) return;
    // Clear drawing area
    const context = game.getContext('2d');
    context.clearRect(0, 0, game.width, game.height);

    // Going backwards through the list to allow removing from the list mid-loop
    for(let i = entities.length - 1; i >= 0; i--){
        if(iterate(entities[i]))
            entities.splice(i, 1);
    }
    for(let i = projectiles.length - 1; i >= 0; i--){
        if(iterate(projectiles[i]))
            projectiles.splice(i, 1);
    }

    draw();
}

// ============================================================================================================================================= //
//   EVENT LISTENERS
// ============================================================================================================================================= //

document.addEventListener("keydown", (e) => {
    switch(e.key){
        case "d":
            movement[2] = 1;
            break;
        case "a":
            movement[3] = 1;
            break;
        case "s":
            movement[1] = 1;
            break;
        case "w":
            movement[0] = 1;
            break;
        default:
            break;
    }
});

document.addEventListener("keyup", (e) => {
    switch(e.key){
        case "d":
            movement[2] = 0;
            break;
        case "a":
            movement[3] = 0;
            break;
        case "s":
            movement[1] = 0;
            break;
        case "w":
            movement[0] = 0;
            break;
        case " ":
            start();
            break;
        default:
            break;
    }
});

game.addEventListener("mousemove", e => {
    mousePos = {X: e.layerX / size, Y: e.layerY / size};
});

game.addEventListener("mousedown", e => {
    firing = true;
});

game.addEventListener("mouseup", e => {
    firing = false;
});

window.onresize = () =>{
    game.height = window.innerHeight;
    game.width = window.innerWidth;
};

// ============================================================================================================================================= //
//   RUNNING
// ============================================================================================================================================= //
game.height = window.innerHeight;
game.width = window.innerWidth;


start();
draw();

