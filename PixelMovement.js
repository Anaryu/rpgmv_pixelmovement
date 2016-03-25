//=============================================================================
// PixelMovement.js
//=============================================================================

/*:
 * @plugindesc Make movement based on a smaller grid so it looks like pixel movement
 * @author Andrew McKellar
 *
 * @help This plugin does not provide plugin commands.

 * @param Step Size
 * @desc How big the player step is, 1 is the full tile, 0.1 would be 1/10 of a tile.
 * @default 0.5
 */

(function() {

  // Get the existing parameters
  var parameters = PluginManager.parameters("PixelMovement");

  // Default set up (get the default value if one isn't set when we read in parameters)
  var step_size = Number(parameters['Step Size'] || 0.5);

  var _Game_CharacterBase_canPass = Game_Player.prototype.canPass;
  Game_Player.prototype.canPass = function(x, y, d) 
  {
    $gameMap.getNewGridLocation(x, y, d);
    return true;
    //return _Game_CharacterBase_canPass.call(this, x2, y2, d);
  };

  Game_Map.prototype.getNewGridLocation = function(x, y, d)
  {
    // Set vars for our new x/y coordinate
    var x2 = x;
    var y2 = y;
    var c1True = false;
    var c2True = false;

    // If it's left or right, update the x
    if (d === 4)
    {
      if ((x - step_size) < Math.floor(x))
      {
        console.log(" -- Changing Square: " + (x-step_size) + " < " + Math.floor(x) + " (" + x + ")");
      }
      else
      {
        console.log("Not changing square");
      }
    }
    else if (d === 6)
    {
      console.log("Left/Right: " + x);
    }
    else if (d === 2)
    {
      console.log("Up/Down: " + y);
    }
    else if (d === 8)
    {

    }
    //return this.roundX(x + (d === 6 ? 0.5 : d === 4 ? -0.5 : 0));
  };

  /*
  Game_CharacterBase.prototype.canPass = function(x, y, d) {
    var x2 = $gameMap.roundXWithDirection(x, d);
    var y2 = $gameMap.roundYWithDirection(y, d);
    if (!$gameMap.isValid(x2, y2)) {
        return false;
    }
    if (this.isThrough() || this.isDebugThrough()) {
        return true;
    }
    if (!this.isMapPassable(x, y, d)) {
        return false;
    }
    if (this.isCollidedWithCharacters(x2, y2)) {
        return false;
    }
    return true;
};
*/

/*
Game_Map.prototype.isValid = function(x, y) {
    return x >= 0 && x < this.width() && y >= 0 && y < this.height();
};

Game_Map.prototype.isPassable = function(x, y, d) {
    return this.checkPassage(x, y, (1 << (d / 2 - 1)) & 0x0f);
};

Game_Map.prototype.checkPassage = function(x, y, bit) {
    var flags = this.tilesetFlags();
    var tiles = this.allTiles(x, y);
    for (var i = 0; i < tiles.length; i++) {
        var flag = flags[tiles[i]];
        if ((flag & 0x10) !== 0)  // [*] No effect on passage
            continue;
        if ((flag & bit) === 0)   // [o] Passable
            return true;
        if ((flag & bit) === bit) // [x] Impassable
            return false;
    }
    return false;
};
*/

  // Check if a new location and starting direction are valid for pass-through

  // Update the movement amount
  var _Game_Map_roundXWithDirection = Game_Map.prototype.roundXWithDirection;
  Game_Map.prototype.roundXWithDirection = function(x, d) 
  {
    return this.roundX(x + (d === 6 ? step_size : d === 4 ? -step_size : 0));
    //return _Game_Map_roundXWithDirection.call(this, x, d);
  };

})();