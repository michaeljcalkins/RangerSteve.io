'use strict'

let console = require('console')
let _ = require('lodash')

module.exports = function(data) {
    // Find player in array
    var movePlayer = _.find(this.players, { id: this.socket.id })

    // Player not found
    if (!movePlayer) {
        console.log('Player not found: ' + this.id)
        return
    }

    // Update player position
    movePlayer.setX(data.x)
    movePlayer.setY(data.y)

    // Broadcast updated position to connected socket clients
    this.io.emit('move player', {
        id: movePlayer.id,
        clientId: movePlayer.clientId,
        x: movePlayer.getX(),
        y: movePlayer.getY()
    })
}
