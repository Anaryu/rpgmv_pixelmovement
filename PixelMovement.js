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

 * @param Player Collider Decrease
 * @desc Pixels to cut from each side of collider for player (to decrease it's size from one full tile)
 * @default 12

 * @param Event Collider Decrease
 * @desc Pixels to cut from each side of collider for events (to decrease it's size from one full tile)
 * @default 8
 */

(function() {

  // Get the existing parameters
  var parameters = PluginManager.parameters("PixelMovement");

  // Default set up (get the default value if one isn't set when we read in parameters)
  var step_size = Number(parameters['Step Size'] || 6);
  var player_collider_decrease = Number(parameters['Player Collider Decrease'] || 12);
  var event_collider_decrease = Number(parameters['Event Collider Decrease'] || 8);

  // Supporting functions
  var isInt = function(n) { return parseInt(n) === n; };
  var stepX = function() { return (step_size / $gameMap.tileWidth()); };
  var stepY = function() { return (step_size / $gameMap.tileHeight()); };
  Game_CharacterBase.prototype.colliderDiff = function(d) 
  { 
    if (d === 4 || d === 6) { return (event_collider_decrease / $gameMap.tileWidth()); }
    else if (d === 2 || d === 8) { return (event_collider_decrease / $gameMap.tileHeight()); }
  };
  Game_Player.prototype.colliderDiff = function(d) 
  { 
    if (d === 4 || d === 6) { return (player_collider_decrease / $gameMap.tileWidth()); }
    else if (d === 2 || d === 8) { return (player_collider_decrease / $gameMap.tileHeight()); }
  };

  // Get the new move point based on our collider and direction
  Game_CharacterBase.prototype.getMovedPoint = function(x, y, d)
  {
    var point = new Array();
    if (d === 4)
    {
      point.push(x + this.colliderDiff(d));
      point.push(y);
    }
    else if (d === 6)
    {
      point.push(x + 1 - this.colliderDiff(d));
      point.push(y);
    }
    else if (d === 2)
    {
      point.push(x);
      point.push(y + this.colliderDiff(d));
    }
    else if (d === 8)
    {
      point.push(x);
      point.push(y + 1 - this.colliderDiff(d));
    }
  }

  // Get the first tile the character is in
  Game_CharacterBase.prototype.getEnteringTiles = function(x, y, d)
  {
    // Declare our array to hold the points
    var points = new Array();

    // Get the 3 valid points
    x1 = x + this.colliderDiff(4);
    x2 = x + 1 - this.colliderDiff(4);
    y1 = y + this.colliderDiff(2);
    y2 = y + 1 - this.colliderDiff(2);

    // Left
    if (d === 4)
    {
      // Add both points
      points.push(Math.floor(x1));
      points.push(Math.floor(y1));
      points.push(Math.floor(x1));
      points.push(Math.floor(y2));
    }
    // Right
    else if d === 6)
    {
      // Add both points
      points.push(Math.floor(x2));
      points.push(Math.floor(y1));
      points.push(Math.floor(x2));
      points.push(Math.floor(y2));
    }
    // Up
    else if (d === 2)
    {
      // Add both points
      points.push(Math.floor(x1));
      points.push(Math.floor(y1));
      points.push(Math.floor(x2));
      points.push(Math.floor(y1));
    1
    // Down
    else if (d === 8)
    {
      // Add both points
      points.push(Math.floor(x1));
      points.push(Math.floor(y2));
      points.push(Math.floor(x2));
      points.push(Math.floor(y2));
    }

    // Return our calculated values
    return points;
  };

  // Create new canPass function check
  var _Game_CharacterBase_canPass = Game_CharacterBase.prototype.canPass;
  Game_Player.prototype.canPass = function(x, y, d) 
  {
    var points = this.getEnteringTiles(x, y, d);
    var nPoint = this.getMovedPoint(x, y, d);
    var mx = nPoint[0];
    var my = nPoint[1];
    var x2 = points[0];
    var x3 = points[2];
    var y2 = points[1];
    var y3 = points[3];
    var c1 = false;
    var c2 = false;

    // If our y value isn't an integer, we're standing on 'two' squares
    var secondXCheck = !isInt(mx);
    var secondYCheck = !isInt(my);
    var xCheck = 0;
    var yCheck = 0;
    // Record if we're even changing tiles
    var changingTile = false;

    // Check each direction, starting with left, then right, up, and finally down
    if (d === 4) 
    { 
      xCheck = Math.floor(mx);
      //var t = (x-stepX()) - this.colliderDiff(d);
      //console.log(xCheck + " > (" + x + " - " + stepX() + " - " + this.colliderDiff(d) + ") " + t + " = " + (t < xCheck));
      // If we're changing tiles, check collision and validity and passability
      if ((mx - stepX()) < xCheck)
      {
        // X value is the same for both points we need to potentially check
        changingTile = true;
        x2 = xCheck;
        x3 = xCheck;
        y2 = Math.floor(my);
        if (secondYCheck) { y3 = Math.ceil(my); }
      }
    }
    else if (d === 6)
    { 
      xCheck = Math.ceil(mx);
      // If we're changing tiles, check collision and validity and passability
      if ((mx + stepX()) > xCheck)
      {
        // X value is the same for both points we need to potentially check
        changingTile = true;
        x2 = xCheck;
        x3 = xCheck;
        y2 = Math.floor(my);
        if (secondYCheck) { y3 = Math.ceil(my); }
      }
    }
    else if (d === 2)
    { 
      yCheck = Math.floor(my);
      // If we're changing tiles, check collision and validity and passability
      if ((my - stepY()) < yCheck)
      {
        // X value is the same for both points we need to potentially check
        changingTile = true;
        y2 = yCheck;
        y3 = yCheck;
        x2 = Math.floor(mx);
        if (secondXCheck) { x3 = Math.ceil(mx); }
      }
    }
    else if (d === 8)
    { 
      yCheck = Math.ceil(my);
      // If we're changing tiles, check collision and validity and passability
      if ((my + stepY()) > yCheck)
      {
        // X value is the same for both points we need to potentially check
        changingTile = true;
        y2 = yCheck;
        y3 = yCheck;
        x2 = Math.floor(mx);
        if (secondXCheck) { x3 = Math.ceil(mx); }
      }
    }

    // If we're changing tiles, check if it's an okay move
    if (changingTile)
    {
      c1 = _Game_CharacterBase_canPass.call(this, x2, y2, d);
      // If our second tile to check isn't the same as the first, check it too
      if (x2 != x3 || y2 != y3) { c2 = _Game_CharacterBase_canPass.call(this, x3, y3, d); console.log("ah ha!"); } else { c2 = true; }
    }
    // If we're not changing tiles, no need to check
    else { c1 = true; c2 = true; }
    console.log("0 ----- " + x + ", " + y + "   becomes  " + mx + ", " + my + " ( " + this.colliderDiff(d) + ")");
    if (changingTile) { console.log("1 ----- " + x2 + "," + y2 + ": " + c1); }
    if (x2 != x3 || y2 != y3) { console.log("2 ----- " + x3 + "," + y3 + ": " + c2); }

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