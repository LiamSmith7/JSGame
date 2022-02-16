import {setWorld, Vector2} from "./src/Utils.js";
import LivingEntity from "./src/entities/LivingEntity.js";
import ClusterEnemy from "./src/entities/enemies/ClusterEnemy.js";
import World from "./src/World.js";
import "./src/Utils.js";

// Client variables
const game = document.getElementById("game");
let canvas = game.getContext("2d");

let screenHalf = new Vector2(100, 100);
let movement = [0, 0, 0, 0]; // 0 = up, 1 = down, 2 = left, 3 = right
let mouseScreenPos = new Vector2(0, 0);

let drawUnitsX = 1;
let drawUnitsY = 1;

function recalculateMousePos(){
    let middleOffset = Vector2.subtract(screenHalf, new Vector2(mouseScreenPos.X, mouseScreenPos.Y));

    world.updateWorldMousePos(Vector2.add(new Vector2(
        (middleOffset.X / zoomMultiplier), 
        (middleOffset.Y / zoomMultiplier)
    ), world.player.position));
}

// ============================================================================================================================================= //
//   WORLD
// ============================================================================================================================================= //

// Game variables
let paused = true;
let world = null;

function start(){
    paused = false;

    clearInterval(game.interval);
    world = new World();
    setWorld(world);

    game.interval = setInterval(update, 20);
}

// ============================================================================================================================================= //
//   DRAWING
// ============================================================================================================================================= //

// Drawing Variables
let zoomMultiplier = 30;
const HEALTHBAR_HEIGHT = 5;

function draw(){

    // Clear canvas
    canvas.clearRect(0, 0, game.width, game.height);

    // The walls start anti-aliasing strangely (gaps in between individual wall blocks) without rounding.
    let originX = Math.round(screenHalf.X - (world.player.position.X * zoomMultiplier));
    let originY = Math.round(screenHalf.Y - (world.player.position.Y * zoomMultiplier));

    let playerX = Math.round(world.player.position.X);
    let playerY = Math.round(world.player.position.Y);
    // World
    for(let x = playerX - drawUnitsX, lX = playerX + drawUnitsX; x < lX; x++){
        for(let y = playerY - drawUnitsY, lY = playerY + drawUnitsY; y < lY; y++){
            if(world.read(x, y) == 1){
                canvas.fillStyle = "#DDDDDD";
                canvas.fillRect(originX + x * zoomMultiplier, originY + y * zoomMultiplier, zoomMultiplier, zoomMultiplier);
            }
        }
    }
    
    // Lines {x1: 0, x2: 0, y1: 0, y2: 0}
    for(let i = 0, l = world.lines.length; i < l; i++){
        let line = world.lines[i];
        canvas.lineWidth = line.thickness;
        canvas.strokeStyle = line.colour;
        canvas.beginPath();
        canvas.moveTo(originX + line.pos1.X * zoomMultiplier, originY + line.pos1.Y * zoomMultiplier);
        canvas.lineTo(originX + line.pos2.X * zoomMultiplier, originY + line.pos2.Y * zoomMultiplier);
        canvas.stroke();
    }

    // Projectiles
    for(let i = 0, l = world.projectiles.length; i < l; i++){
        let projectile = world.projectiles[i];
        let position = projectile.position;
        canvas.lineWidth = projectile.hitbox.Y * zoomMultiplier;
        canvas.strokeStyle = projectile.colour;
        let start = projectile.oldPositions[projectile.oldPositions.length - 1];
        canvas.beginPath();
        canvas.moveTo(originX + start.X * zoomMultiplier, originY + start.Y * zoomMultiplier);
        canvas.lineTo(originX + position.X * zoomMultiplier, originY + position.Y * zoomMultiplier);
        canvas.stroke();
    }

    // Entities
    for(let i = 0, l = world.entities.length; i < l; i++){
        let entity = world.entities[i];
        canvas.setTransform(1, 0, 0, 1, 0, 0); // Reset rotations
        let x = originX + (entity.position.X - entity.hitboxHalf.X) * zoomMultiplier;
        let y = originY + (entity.position.Y - entity.hitboxHalf.Y) * zoomMultiplier;
        let xSize = entity.hitbox.X * zoomMultiplier;
        let ySize = entity.hitbox.Y * zoomMultiplier

        // Body
        canvas.fillStyle = entity.colour;
        canvas.fillRect(x, y, xSize, ySize);

        if(entity instanceof LivingEntity){
            // Healthbar
            if(entity._showHealthbar){
                let healthbarOffset = y - 10
                let healthPercentage = (1 / entity.maxHealth) * entity.health
                canvas.fillStyle = "#000000";
                canvas.fillRect(x - 1, healthbarOffset - 1, xSize + 2, HEALTHBAR_HEIGHT + 2);

                canvas.fillStyle = "#FF0000";
                canvas.fillRect(x, healthbarOffset, xSize, HEALTHBAR_HEIGHT);
                canvas.fillStyle = "#00FF00";
                canvas.fillRect(x, healthbarOffset, xSize * healthPercentage, HEALTHBAR_HEIGHT);
            }

            // Turrets
            canvas.translate(originX + entity.position.X * zoomMultiplier, originY + entity.position.Y * zoomMultiplier);
            canvas.rotate(entity.angle);
            canvas.fillStyle = "#777777";
            if(entity instanceof ClusterEnemy){
                canvas.fillRect(-0.1 * zoomMultiplier, -0.25 * zoomMultiplier, 1 * zoomMultiplier, 0.5 * zoomMultiplier );
            }
            else{
                canvas.fillRect(-0.1 * zoomMultiplier, -0.1 * zoomMultiplier, 1 * zoomMultiplier, 0.2 * zoomMultiplier );
            }
        }
    }

    canvas.setTransform(1, 0, 0, 1, 0, 0);
    // Instructions
    canvas.font = "20px Arial";
    canvas.fillStyle = "#FFFFFF";
    canvas.fillText("Movement - WASD", 10, 20); 
    canvas.fillText("Fire projectile - Left Click", 10, 40); 
    canvas.fillText("Fire laser - R", 10, 60); 
    canvas.fillText("Pause - P", 10, 80); 
    canvas.fillText("Reset - Space", 10, 100);
    canvas.fillText("Position [" + world.player.position.X + ", " + world.player.position.Y + "]", 10, 120);
}


// ============================================================================================================================================= //
//   UPDATES
// ============================================================================================================================================= //

// Returns true if the entity/projectile is being removed

function update(e){
    if (paused) return;
    if(movement[0] != 0 || movement[1] != 0 || movement[2] != 0 || movement[3] != 0)
        recalculateMousePos();
    world.update(e, movement);
    draw();
}

// ============================================================================================================================================= //
//   EVENT LISTENERS
// ============================================================================================================================================= //

let pauseDebounce = false;
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
        case "p":
            if(!pauseDebounce){
                pauseDebounce = true;
                paused = !paused;
            }
            if(paused){
                canvas.fillStyle = "rgba(0, 0, 0, 0.7)"
                canvas.fillRect(0, 0, game.width, game.height);
            }
            break;
        case "r":
            world.player.updateFiringLaser(true);
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
        case "p":
            pauseDebounce = false;
            break;
        case "r":
            world.player.updateFiringLaser(false);
            break;
        default:
            break;
    }
});

game.addEventListener("mousemove", e => {
    mouseScreenPos = new Vector2(e.layerX, e.layerY);
    recalculateMousePos();
});

game.addEventListener("mousedown", e => {
    world.player.updateFiringProjectiles(true);
});

game.addEventListener("mouseup", e => {
    world.player.updateFiringProjectiles(false);
});

function resizeWindow(){
    game.height = window.innerHeight;
    game.width = window.innerWidth;
    screenHalf = new Vector2(window.innerWidth / 2, window.innerHeight / 2);

    // Sets up the draw distance away from the player
    drawUnitsX = Math.ceil((window.innerWidth / zoomMultiplier) / 2) + 1;
    drawUnitsY = Math.ceil((window.innerHeight / zoomMultiplier) / 2) + 1;
}

window.onresize = resizeWindow;

// ============================================================================================================================================= //
//   RUNNING
// ============================================================================================================================================= //

resizeWindow();
start();
draw();
