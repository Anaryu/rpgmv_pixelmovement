//=============================================================================
// PixelMovement.js
//=============================================================================

/*:
 * @plugindesc Make movement based on a smaller grid so it looks like pixel movement
 * @author Andrew McKellar
 *
 * @help This plugin does not provide plugin commands.
 */

(function() {

  // Update the movement amount
  var _Game_Map_roundXWithDirection = Game_Map.prototype.roundXWithDirection;
  Game_Map.prototype.roundXWithDirection = function(x, d) {
    console.log("Interruption!");
    return _Game_Map_roundXWithDirection.call(this, x, d);
  };

})();