'use strict'

import EventHandler from '../EventHandler'

module.exports = function(data) {
    if (data.damagedPlayerId !== ('/#' + this.socket.id))
        return

    this.player.meta.health = data.health
    EventHandler.emit('health update', this.player.meta.health)
}
