'use strict'

let RemotePlayer = require('../RemotePlayer')

module.exports = function(data) {
    console.log('update players', data)

    this.roomId = data.room.id

    let newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + data.room.id;
    window.history.pushState({ path: newurl }, '', newurl);

    this.enemies.forEach(function (enemy) {
        enemy.player.kill()
    })

    this.enemies = []

    data.room.players.forEach((player) => {
        if (player.id === ('/#' + this.socket.id)) {
            // this.scoreText.text = player.meta.score
            return
        }

        let newRemotePlayer = RemotePlayer.call(this, player.id, this.game, this.player, player.x, player.y)
        this.enemies.push(newRemotePlayer)
        this.enemies[this.enemies.length - 1].player.animations.add('left', [0, 1, 2, 3], 10, true)
        this.enemies[this.enemies.length - 1].player.animations.add('right', [5, 6, 7, 8], 10, true)
    })
}
