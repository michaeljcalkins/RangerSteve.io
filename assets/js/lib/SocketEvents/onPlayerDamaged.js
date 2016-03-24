'use strict'

module.exports = function(data) {
    if (data.damagedPlayerId !== ('/#' + this.socket.id))
        return

    this.player.meta.health = data.health
    this.healthText.text = this.player.meta.health
}
