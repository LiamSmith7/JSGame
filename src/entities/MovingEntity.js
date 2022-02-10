import {Vector2, round, readWorld} from "../Utils.js";
import Entity from "./Entity.js";

// This entity can move and can collide with the world
class MovingEntity extends Entity {
    constructor(posX, posY){
        super(posX, posY);
        this._momentum = new Vector2(0.0, 0.0);
    }
    update(){
        // The update method returns a value based off of what was hit and from what direction.

        // If null, nothing was hit.
        // If true, hit the bottom or top of the wall.
        // If false, hit the left or right of the wall.

        super.update();

        // Position + Momentum * lastUpdate.Milliseconds;
        // Update entity position
        let newPosition = Vector2.add(this._position, this._momentum);
        let oldEntityHitboxTopLeftCorner = new Vector2(this._position.X - this._hitboxHalf.X, this._position.Y - this._hitboxHalf.Y);
        let newEntityHitboxTopLeftCorner = new Vector2(newPosition.X - this._hitboxHalf.X, newPosition.Y - this._hitboxHalf.Y);
        
        //*/
        let overlapTile = new Vector2(0, 0);
        let overlapCount = 0;
        let edgeCase = false;

        let x = Math.floor(newEntityHitboxTopLeftCorner.X);
        let y = Math.floor(newEntityHitboxTopLeftCorner.Y);

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
                if (readWorld(x, y) == 1)
                {
                    // overlapTile might need to be used for positioning the entity correctly during an edge case.
                    overlapTile = new Vector2(x, y);
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
            let travelDistance = new Vector2(
                newEntityHitboxTopLeftCorner.X - oldEntityHitboxTopLeftCorner.X,
                newEntityHitboxTopLeftCorner.Y - oldEntityHitboxTopLeftCorner.Y
            );
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
        this._position = new Vector2(round(newPosition.X), round(newPosition.Y));

        // Returns true if entity hit a wall
        return hitFace;
    }
}

export default MovingEntity;