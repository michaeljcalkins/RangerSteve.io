'use strict'

let console = require('console')
let _ = require('lodash')

module.exports = function(data) {
    // Find player in array
    var movePlayer = _.find(this.players, { id: this.client.id })

    // Player not found
    if (!movePlayer) {
        console.log('Moving player not found: ' + this.client.id)
        return
    }

    // Update player position
    movePlayer.setX(data.x)
    movePlayer.setY(data.y)

    // Broadcast updated position to connected socket clients
    this.client.broadcast.emit('move player', {
        id: movePlayer.id,
        x: movePlayer.getX(),
        y: movePlayer.getY()
    })
}
