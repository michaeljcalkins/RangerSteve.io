var util = require('util')

var Player = require('./Player')
var players = []

function playerById (id) {
    var i
    for (i = 0; i < players.length; i++) {
        if (players[i].id === id) {
            return players[i]
        }
    }

    return false
}

module.exports = function(io) {
    io.on('connection', function(socket) {
        // Listen for new player message
        socket.on('new player', function onNewPlayer (data) {
            util.log('Creating new player...', data)

            // Create a new player
            var newPlayer = new Player(data.x, data.y)
            newPlayer.id = this.id

            // Broadcast new player to connected socket clients
            io.emit('new player', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY()})

            // Send existing players to the new player
            var i, existingPlayer
            for (i = 0; i < players.length; i++) {
                existingPlayer = players[i]
                io.emit('new player', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY()})
            }

            // Add new player to the players array
            players.push(newPlayer)
        })

        // Listen for move player message
        socket.on('move player', function onMovePlayer (data) {
            // Find player in array
            var movePlayer = playerById(this.id)

            // Player not found
            if (!movePlayer) {
                util.log('Player not found: ' + this.id)
                return
            }

            // Update player position
            movePlayer.setX(data.x)
            movePlayer.setY(data.y)

            // Broadcast updated position to connected socket clients
            io.emit('move player', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY()})
        })

        socket.on('disconnect', function onClientDisconnect () {
            util.log('Player has disconnected: ' + this.id)

            var removePlayer = playerById(this.id)

            // Player not found
            if (!removePlayer) {
                util.log('Player not found: ' + this.id)
                return
            }

            // Remove player from players array
            players.splice(players.indexOf(removePlayer), 1)

            // Broadcast removed player to connected socket clients
            this.broadcast.emit('remove player', {id: this.id})
        })
    })
}
