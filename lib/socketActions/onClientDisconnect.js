'use strict'

var console = require('console')
var _ = require('lodash')

// Socket client has disconnected
module.exports = function() {
    console.log('Player has disconnected: ' + this.socket.id)

    var removePlayer = _.findIndex(this.players, { id: this.socket.id })

    // Player not found
    console.log(this.socket)
    if (!removePlayer) {
        console.log('Player not found: ' + this.socket.id)
        return
    }

    // Remove player from players array
    this.players.splice(this.players.indexOf(removePlayer), 1)

    // Broadcast removed player to connected socket clients
    this.io.emit('remove player', {
        id: this.id
    })
}
