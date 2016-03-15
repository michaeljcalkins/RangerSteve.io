'use strict'

let RemotePlayer = require('../RemotePlayer')

module.exports = function(data) {
    this.enemies.forEach(function (enemy) {
        enemy.player.kill()
    })

    this.enemies = []

    data.players.forEach((player) => {
        if (player.id === ('/#' + this.socket.id))
            return

        let newRemotePlayer = RemotePlayer.call(this, player.id, this.game, this.player, player.x, player.y)
        this.enemies.push(newRemotePlayer)
        this.enemies[this.enemies.length - 1].player.animations.add('left', [0, 1, 2, 3], 10, true)
        this.enemies[this.enemies.length - 1].player.animations.add('right', [5, 6, 7, 8], 10, true)
    })
}
