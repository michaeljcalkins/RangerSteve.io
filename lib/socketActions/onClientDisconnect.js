'use strict'

var util = require('util')
var _ = require('lodash')

// Socket client has disconnected
module.exports = function() {
    util.log('Player has disconnected: ' + this.id)

    var removePlayer = _.findIndex(this.players, { id: this.id })

    // Player not found
    if (!removePlayer) {
        util.log('Player not found: ' + this.id)
        return
    }

    // Remove player from players array
    this.players.splice(this.players.indexOf(removePlayer), 1)

    // Broadcast removed player to connected socket clients
    io.emit('remove player', {
        id: this.id
    })
}
