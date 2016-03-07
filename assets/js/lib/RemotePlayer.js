'use strict'

let RemotePlayer = {
    lastPosition: {
        x: 0,
        y: 0
    }
}

RemotePlayer.update = function () {
    if (this.player.x !== this.lastPosition.x || this.player.y !== this.lastPosition.y) {
        this.player.play('move')
    } else {
        this.player.play('stop')
    }

    this.lastPosition.x = this.player.x
    this.lastPosition.y = this.player.y
}

module.exports = {
    create: function(index, game, player, startX, startY) {
        let newRemotePlayer = {
            x: startX,
            y: startY,
            game: game,
            health: 100,
            player: player,
            alive: true,
            lastPosition: {
                x: startX,
                y: startY
            }
        }

        newRemotePlayer = Object.assign(RemotePlayer, newRemotePlayer)

        // Create the player's enemy sprite
        newRemotePlayer.player = game.add.sprite(startX, startY, 'enemy')

        // Our two animations, walking left and right.
        newRemotePlayer.player.animations.add('left', [0, 1, 2, 3], 10, true)
        newRemotePlayer.player.animations.add('right', [5, 6, 7, 8], 10, true)

        newRemotePlayer.player.name = index.toString()

        return newRemotePlayer
    }
}
