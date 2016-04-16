'use strict'

import EventHandler from '../EventHandler'

let damageTimeout = null
let healingInterval = null
let lastKnownHealth = null

module.exports = function(data) {
    if (data.damagedPlayerId !== ('/#' + this.socket.id))
        return

    this.player.meta.health = data.health
    EventHandler.emit('health update', String(this.player.meta.health))

    if (this.player.meta.health > 55 && this.player.meta.health < 100) {
        clearTimeout(damageTimeout)
        damageTimeout = setTimeout(() => {
            // Player's health will fully regenerate
            this.socket.emit('player full health', {
                roomId: this.roomId
            })
        }, 5000)
    }

    if (this.player.meta.health > 0 && this.player.meta.health <= 55) {
        // Wait 5 seconds to begin healing process
        clearTimeout(damageTimeout)
        clearInterval(healingInterval)
        damageTimeout = setTimeout(() => {
            lastKnownHealth = this.player.meta.health
            healingInterval = setInterval(() => {
                if (lastKnownHealth >= 100) {
                    clearInterval(healingInterval)
                }

                lastKnownHealth += 10

                // Increase player health by 10 every 1/2 a second
                this.socket.emit('player healing', {
                    roomId: this.roomId
                })
            }, 500)
        }, 5000)
    }
}
