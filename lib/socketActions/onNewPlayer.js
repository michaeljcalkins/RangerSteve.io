'use strict'

var console = require('console')
var Player = require('../player')

module.exports = function(data) {
    // Create a new player
    var newPlayer = new Player(data.x, data.y)
    newPlayer.id = this.client.id

    // Broadcast new player to connected socket clients
    this.client.broadcast.emit('new player', {
        id: newPlayer.id,
        x: newPlayer.getX(),
        y: newPlayer.getY()
    })

    // Send existing players to the new player
    this.players.forEach((player) => {
        this.client.emit('new player', {
            id: player.id,
            x: player.getX(),
            y: player.getY()
        })
    })

    // Add new player to the players array
    this.players.push(newPlayer)
}
