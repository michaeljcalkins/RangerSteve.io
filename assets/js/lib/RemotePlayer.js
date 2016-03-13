'use strict'

let RemotePlayer = function(id, game, player, startX, startY) {
    let newRemotePlayer = {
        x: startX,
        y: startY,
        id: null,
        game: game,
        health: 100,
        player: player,
        alive: true,
        lastPosition: {
            x: startX,
            y: startY
        }
    }

    // Create the player's enemy sprite
    newRemotePlayer.player = game.add.sprite(startX, startY, 'enemy')

    // Our two animations, walking left and right.
    newRemotePlayer.player.animations.add('left', [0, 1, 2, 3], 10, true)
    newRemotePlayer.player.animations.add('right', [5, 6, 7, 8], 10, true)

    newRemotePlayer.player.id = id

    return newRemotePlayer
}

module.exports = RemotePlayer
