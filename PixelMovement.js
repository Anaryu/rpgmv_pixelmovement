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
 * @default 16

 * @param Event Collider Decrease
 * @desc Pixels to cut from each side of collider for events (to decrease it's size from one full tile)
 * @default 12 
 */

(function() {

  // Get the existing parameters
  var parameters = PluginManager.parameters("PixelMovement");

  // Default set up (get the default value if one isn't set when we read in parameters)
  var step_size = Number(parameters['Step Size'] || 6);
  var player_collider_decrease = Number(parameters['Player Collider Decrease'] || 16);
  var event_collider_decrease = Number(parameters['Event Collider Decrease'] || 12);

  // Supporting functions
  var isInt = function(n) { return parseInt(n) === n; };
  var stepX = function() { return (step_size / $gameMap.tileWidth()); };
  var stepY = function() { return (step_size / $gameMap.tileHeight()); };
  Game_CharacterBase.prototype.samePoints = function(x1, y1, x2, y2) { return (x1 == x2 && y1 == y2); }
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
    // Add our current position
    var point = new Array();
    point.push(x);
    point.push(y);

    // Adjust the point that is changing
    if (d === 4) { point[0] = (x - stepX()); }
    if (d === 6) { point[0] = (x + stepX()); }
    if (d === 8) { point[1] = (y - stepY()); }
    if (d === 2) { point[1] = (y + stepY()); }

    // Return calculated point
    return point;
  }

  // Get the first tile the character is in
  Game_CharacterBase.prototype.getEnteringTiles = function(x, y, d)
  {
    // Declare our array to hold the points
    var points = new Array();

    // Get the 3 valid points
    x1 = x + this.colliderDiff(4);
    x2 = x + 1 - this.colliderDiff(4);
    y1 = y + (1.5 * this.colliderDiff(2));
    y2 = y + 1 - (0.5 * this.colliderDiff(2));

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
    else if (d === 6)
    {
      // Add both points
      points.push(Math.floor(x2));
      points.push(Math.floor(y1));
      points.push(Math.floor(x2));
      points.push(Math.floor(y2));
    }
    // Up
    else if (d === 8)
    {
      // Add both points
      points.push(Math.floor(x1));
      points.push(Math.floor(y1));
      points.push(Math.floor(x2));
      points.push(Math.floor(y1));
    }
    // Down
    else if (d === 2)
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
  Game_CharacterBase.prototype.canPass = function(x, y, d) 
  {
    // Get the 'moved' point after our move value is applied to our current location
    var nPoint = this.getMovedPoint(x, y, d);
    // Get the original tiles we're in
    var cPoints = this.getEnteringTiles(x, y, d);
    // Get the new tiles we're int
    var nPoints = this.getEnteringTiles(nPoint[0], nPoint[1], d);
    var c1 = true;
    var c2 = true;

    // Record if we're even changing tiles
    if (!this.samePoints(cPoints[0], cPoints[1], nPoints[0], nPoints[1]))
    { c1 = _Game_CharacterBase_canPass.call(this, cPoints[0], cPoints[1], d); }
    if (!this.samePoints(cPoints[2], cPoints[3], nPoints[2], nPoints[3]))
    { c2 = _Game_CharacterBase_canPass.call(this, cPoints[2], cPoints[3], d); }

    // Return if both points are valid
    return (c1 && c2);
  };

  // Check passage rewrites
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

  // *** Handling Animation Updates *** //
  
  // Account for small pixel movement and slower general movement for animations
  var _Game_CharacterBase_updateAnimationCount = Game_CharacterBase.prototype.updateAnimationCount;
  Game_CharacterBase.prototype.updateAnimationCount = function()
  {
    // Update our animation count if we haven't been stopped, since pixel movement can be slow
    if (this._stopCount < 15) { this._animationCount += 0.5; }
    _Game_CharacterBase_updateAnimationCount.call(this);
  };

})();