'use strict'

import EventHandler from '../EventHandler'
let HighRuleDesert = require('../../maps/HighRuleDesert')

module.exports = function(data) {
    if (data.damagedPlayerId !== ('/#' + this.socket.id))
        return

    this.player.meta.health = data.health
    EventHandler.emit('health update', String(this.player.meta.health))

    let spawnPoint = HighRuleDesert.getRandomSpawnPoint.call(this)
    this.player.x = spawnPoint.x
    this.player.y = spawnPoint.y
}
