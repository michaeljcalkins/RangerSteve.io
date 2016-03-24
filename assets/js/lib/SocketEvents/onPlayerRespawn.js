'use strict'

let ForestCtf = require('../../maps/ForestCtf')

module.exports = function(data) {
    if (data.damagedPlayerId !== ('/#' + this.socket.id))
        return

    console.log('respawn!')

    this.player.meta.health = data.health
    this.healthText.text = this.player.meta.health

    let spawnPoint = ForestCtf.getRandomSpawnPoint.call(this)
    this.player.x = spawnPoint.x
    this.player.y = spawnPoint.y
}
