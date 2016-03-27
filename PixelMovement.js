//=============================================================================
// PixelMovement.js
//=============================================================================

/*:
 * @plugindesc Make movement based on a smaller grid so it looks like pixel movement
 * @author Andrew McKellar
 *
 * @help This plugin does not provide plugin commands.

 * @param Step Size
 * @desc How many pixels each 'step' is.
 * @default 6 
 */

(function() {

  // Get the existing parameters
  var parameters = PluginManager.parameters("PixelMovement");

  // Default set up (get the default value if one isn't set when we read in parameters)
  var step_size = Number(parameters['Step Size'] || 6);

  // Supporting functions
  var isInt = function(n) { return parseInt(n) === n; };
  var stepX = function() { return (step_size / $gameMap.tileWidth()); };
  var stepY = function() { return (step_size / $gameMap.tileHeight()); };

  // Create new canPass function check
  var _Game_CharacterBase_canPass = Game_CharacterBase.prototype.canPass;
  Game_Player.prototype.canPass = function(x, y, d) 
  {
    // Set vars for our new x/y coordinate
    var x2 = x;
    var x3 = x;
    var y2 = y;
    var y3 = y;
    var c1 = false;
    var c2 = false;

    // If our y value isn't an integer, we're standing on 'two' squares
    var secondXCheck = !isInt(x);
    var secondYCheck = !isInt(y);
    var xCheck = 0;
    var yCheck = 0;
    if (d === 4) 
    { 
      xCheck = Math.floor(x);
      // If we're changing tiles, check collision and validity and passability
      if ((x - stepX()) < xCheck)
      {
        // X value is the same for both points we need to potentially check
        x2 = xCheck;
        x3 = xCheck;
        y2 = Math.floor(y);
        if (secondYCheck) { y3 = Math.ceil(y); }
      }
    }
    else if (d === 6)
    { 
      xCheck = Math.ceil(x);
      // If we're changing tiles, check collision and validity and passability
      if ((x + stepX()) > xCheck)
      {
        // X value is the same for both points we need to potentially check
        x2 = xCheck;
        x3 = xCheck;
        y2 = Math.floor(y);
        if (secondYCheck) { y3 = Math.ceil(y); }
      }
    }
    else if (d === 2)
    { 
      yCheck = Math.floor(y);
      // If we're changing tiles, check collision and validity and passability
      if ((y - stepY()) < yCheck)
      {
        // X value is the same for both points we need to potentially check
        y2 = yCheck;
        y3 = yCheck;
        x2 = Math.floor(x);
        if (secondXCheck) { x3 = Math.ceil(x); }
      }
    }
    else if (d === 8)
    { 
      yCheck = Math.ceil(y);
      // If we're changing tiles, check collision and validity and passability
      if ((y + stepY()) > yCheck)
      {
        // X value is the same for both points we need to potentially check
        y2 = yCheck;
        y3 = yCheck;
        x2 = Math.floor(x);
        if (secondXCheck) { x3 = Math.ceil(x); }
      }
    }

    // Check both potential points
    c1 = _Game_CharacterBase_canPass.call(this, x2, y2, d);
    c2 = _Game_CharacterBase_canPass.call(this, x3, y3, d);
    console.log(x3 + "," + y3 + ": " + c1);
    console.log(x3 + "," + y3 + ": " + c2);

    // Return if both points are valid
    return (c1 && c2);
  };

  var _Game_Map_checkPassage = Game_Map.prototype.checkPassage;
  Game_Map.prototype.checkPassage = function(x, y, bit)
  {
    var c1 = _Game_Map_checkPassage.call(this, Math.floor(x), Math.floor(y), bit);
    var c2 = _Game_Map_checkPassage.call(this, Math.ceil(x), Math.ceil(y), bit);
    var c3 = _Game_Map_checkPassage.call(this, Math.floor(x), Math.ceil(y), bit);
    var c4 = _Game_Map_checkPassage.call(this, Math.ceil(x), Math.floor(y), bit);
    return (c1 && c2 && c3 && c4);
  };

  // Update the movement amount for simple x direction checks
  var _Game_Map_xWithDirection = Game_Map.prototype.xWithDirection;
  Game_Map.prototype.xWithDirection = function(x, d)
  { return x + (d === 6 ? stepX() : d === 4 ? -stepX() : 0); };
  var _Game_Map_yWithDirection = Game_Map.prototype.yWithDirection;
  Game_Map.prototype.yWithDirection = function(x, d)
  { return x + (d === 2 ? stepY() : d === 8 ? -stepY() : 0); };

  // Update the movement amount
  var _Game_Map_roundXWithDirection = Game_Map.prototype.roundXWithDirection;
  Game_Map.prototype.roundXWithDirection = function(x, d) 
  { return this.roundX(x + (d === 6 ? stepX() : d === 4 ? -stepX() : 0)); };
  var _Game_Map_roundYWithDirection = Game_Map.prototype.roundYWithDirection;
  Game_Map.prototype.roundYWithDirection = function(y, d) 
  { return this.roundY(y + (d === 2 ? stepY() : d === 8 ? -stepY() : 0)); };

})();