import LayoutManager from "./layout/LayoutManager.js";
import LevelsManager from "./layout/LevelsManager.js";
import Player from "./entities/Player.js";

const iterate = (item) => {
    item.update();
    return item.removed;
}

class World{
    constructor(){
        this._paused = false;
        this._player = new Player(2, 2);
        this._entities = [this._player];
        this._projectiles = [];
        this._lines = [];

        // World layout
        this._layoutManager = new LayoutManager();
        LevelsManager.layout.forEach((yArray, x) => {
            yArray.forEach((id, y) => {
                this._layoutManager.place(x, y, id)
            });
        });

        LevelsManager.summon().forEach(entity => {
            this._entities.push(entity);
        });

        this._player.position = LevelsManager.playerSpawn;
    }
    // GET
    get entities(){
        return this._entities;
    }
    get projectiles(){
        return this._projectiles;
    }
    get lines(){
        return this._lines;
    }
    get layout() {
        return this._layoutManager.layout;
    }
    get player(){
        return this._player;
    }
    updateWorldMousePos(newMouseWorldPos){
        this._player.updateMouseWorldPos(newMouseWorldPos);
    }
    read(x, y){
        return this._layoutManager.read(x, y);
    }
    // UPDATE
    update(e, newPlayerMovement){
        this._player.updateMovement(newPlayerMovement);
        // Going backwards through the lists to allow removing from the list mid-loop
        for(let i = this._entities.length - 1; i >= 0; i--){
            if(iterate(this._entities[i])) this._entities.splice(i, 1);
        } 
        for(let i = this._projectiles.length - 1; i >= 0; i--){
            if(iterate(this._projectiles[i])) this._projectiles.splice(i, 1);          
        }
        for(let i = this._lines.length - 1; i >= 0; i--){
            if(iterate(this._lines[i])) this._lines.splice(i, 1);
        }
    }
    spawnProjectile(projectile){
        this._projectiles.push(projectile);
    }
    spawnLine(line){
        this._lines.push(line);
    }
}

export default World;