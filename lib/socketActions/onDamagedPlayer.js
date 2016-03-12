'use strict'

let _ = require('lodash')

module.exports = function(data) {
    console.log(data)

    let attackingPlayerId = this.socket.id

    if (!data.damagedPlayerId) {
        console.error('Missing damaged player id.')
        return
    }

    // Find player in array
    var damagedPlayer = _.find(this.players, { id: data.damagedPlayerId })

    // Player not found
    if (!damagedPlayer) {
        console.log('Damaged player not found: ' + data.damagedPlayerId)
        this.io.emit('remove player', {
            id: data.damagedPlayerId
        })
        return
    }

    damagedPlayer.health -= +data.damage
    console.log(`Player ${attackingPlayerId} damaged ${data.damagedPlayerId} by ${data.damage}.  New health: ${damagedPlayer.health}`)

    if (damagedPlayer.health <= 0) {
        console.log(`Player ${attackingPlayerId} killed ${data.damagedPlayerId}`)

        // Broadcast updated position to connected socket clients
        this.io.emit('dead player', {
            deadPlayerId: data.damagedPlayerId
        })
        damagedPlayer.health = 100
    }
}
