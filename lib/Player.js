/* ************************************************
** GAME PLAYER CLASS
************************************************ */
var Player = function (startX, startY) {
    var x = startX
    var y = startY
    var id

    // Define which variables and methods can be accessed
    return {
        x,
        y,
        id: id
    }
}

// Export the Player class so you can use it in
// other files by using require("Player")
module.exports = Player
