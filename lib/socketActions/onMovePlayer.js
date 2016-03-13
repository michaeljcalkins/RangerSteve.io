'use strict'

let console = require('console')
let util = require('../util')

module.exports = function(data) {

    let playerById = (id) => {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].id === id) {
                return this.players[i]
            }
        }

        return false
    }


    // Find player in array
    var movePlayer = playerById(this.client.id)

    // Player not found
    if (!movePlayer) {
        console.log('Moving player not found: ' + this.client.id)
        return
    }

    movePlayer.x = data.x
    movePlayer.y = data.y

    // Update player position
    // movePlayer.setX(data.x)
    // movePlayer.setY(data.y)

    console.log(this.client.id, data.x, data.y)

    // Broadcast updated position to connected socket clients
    this.client.broadcast.emit('move player', {
        id: this.client.id,
        x: movePlayer.getX(),
        y: movePlayer.getY()
    })
}
