'use strict'

let PlayerById = require('../PlayerById')

module.exports = function(data) {
    let movePlayer = PlayerById.call(this, data.id)

    // Player not found
    if (! movePlayer) {
        return
    }

    // Update player position
    movePlayer.player.x = data.x
    movePlayer.player.y = data.y

    if (movePlayer.player.x > movePlayer.lastPosition.x) {
        movePlayer.player.animations.play('right')
    }
    else if (movePlayer.player.x < movePlayer.lastPosition.x)
    {
        movePlayer.player.animations.play('left')
    }
    else
    {
        movePlayer.player.animations.stop()
        movePlayer.player.frame = 4
    }

    movePlayer.lastPosition.x = movePlayer.player.x
    movePlayer.lastPosition.y = movePlayer.player.y
}
