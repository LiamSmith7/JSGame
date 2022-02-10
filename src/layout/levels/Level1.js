import DefaultLevel from "./DefaultLevel.js";
//import Enemy from "../../entities/enemies/Enemy.js";
import LargeEnemy from "../../entities/enemies/LargeEnemy.js";
import Enemy from "../../entities/enemies/Enemy.js";
import ClusterEnemy from "../../entities/enemies/ClusterEnemy.js";
import PathfindingEnemy from "../../entities/enemies/PathfindingEnemy.js";

class Level1 extends DefaultLevel{
    constructor(){
        super(0, 0);

        // Building 1
        this._layoutManager.placeHorizontal(12, 12, 22, 1);
        this._layoutManager.placeHorizontal(18, 12, 22, 1);
        this._layoutManager.placeVertical(12, 12, 18, 1);
        this._layoutManager.placeVertical(22, 12, 18, 1);

        this._layoutManager.place(17, 18, null);
        this._layoutManager.place(14, 14, 1);
    
        // Building 2
        this._layoutManager.placeBox(15, 23, 28, 28, 1);
        this._layoutManager.placeBox(16, 24, 27, 27, null);
        this._layoutManager.place(21, 23, null);
    
        // Building 3 
        this._layoutManager.placeBox(24, 13, 28, 20, 1);
        this._layoutManager.placeBox(26, 13, 26, 20, null);
    }
    summon(){
        return [
            //new Enemy(12, 28),
            //new Enemy(26.8, 25),
            //new LargeEnemy(21.2, 13.6)
            new ClusterEnemy(21.2, 13.6),
            new PathfindingEnemy(12, 28)
        ];
    }
}

export default Level1;