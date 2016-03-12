'use strict'

let _ = require('lodash')

module.exports = function(data) {
    // Find player in array
    var damagedPlayer = _.find(data.playerId)

    // Player not found
    if (!damagedPlayer) {
        util.log('Player not found: ' + this.id)
        return
    }

    console.log(damagedPlayer.health)
    damagedPlayer.health -= +data.damage
    util.log('Player damaged', damagedPlayer.health, data.playerId)

    if (damagedPlayer.health <= 0) {
        console.log('Player killed:', damagedPlayer.health, data.playerId, damagedPlayer.clientId)
        // Broadcast updated position to connected socket clients
        io.emit('dead player', {
            deadPlayerId: data.playerId
        })
        damagedPlayer.health = 100
    }
}
