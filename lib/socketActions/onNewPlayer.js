'use strict'

var console = require('console')
var Player = require('../player')

module.exports = function(data) {
    console.log('Creating new player...', data)

    // Create a new player
    var newPlayer = new Player(data.x, data.y)
    newPlayer.id = this.socket.id
    newPlayer.clientId = data.clientId
    newPlayer.health = 100

    console.log(newPlayer)

    // Broadcast new player to connected socket clients
    this.socket.broadcast.emit('new player', {
        health: newPlayer.health,
        clientId: newPlayer.clientId,
        id: newPlayer.id,
        x: newPlayer.getX(),
        y: newPlayer.getY()
    })

    // Send existing players to the new player
    var i, existingPlayer
    for (i = 0; i < this.players.length; i++) {
        existingPlayer = this.players[i]
        this.io.emit('new player', {
            health: 100,
            clientId: existingPlayer.clientId,
            id: existingPlayer.id,
            x: existingPlayer.getX(),
            y: existingPlayer.getY()
        })
    }

    // Add new player to the players array
    this.players.push(newPlayer)
}
