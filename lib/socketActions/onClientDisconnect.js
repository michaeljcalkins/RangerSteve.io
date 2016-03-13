'use strict'

var console = require('console')
let util = require('../util')

// Socket client has disconnected
module.exports = function() {
    console.log('Player has disconnected: ' + this.client.id)

    var removePlayer = util.playerById.call(this, this.client.id)

    // Player not found
    if (!removePlayer) {
        console.log('Player not found: ' + this.client.id)
        return
    }

    // Remove player from players array
    this.players.splice(this.players.indexOf(removePlayer), 1)

    // Broadcast removed player to connected socket clients
    this.client.broadcast.emit('remove player', {
        id: this.client.id
    })
}
