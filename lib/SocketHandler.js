var util = require('util')

var Player = require('./Player')
var players = []
var io = null
var currentSocket = null

module.exports = function(ioInstance) {
    io = ioInstance

    setEventHandlers()
}

function setEventHandlers() {
    // Socket.IO
    io.on('connection', onSocketConnection.bind(this))
}

setInterval(function() {
    console.log(players)
}, 4000)

// New socket connection
function onSocketConnection(socket) {
    currentSocket = socket
    util.log('New player has connected: ' + socket.id)

    // Listen for client disconnected
    socket.on('disconnect', onClientDisconnect)

    // Listen for new player message
    socket.on('new player', onNewPlayer)

    // Listen for move player message
    socket.on('move player', onMovePlayer)
}

// Socket client has disconnected
function onClientDisconnect() {
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
    io.emit('remove player', {
        id: this.id
    })
}

// New player has joined
function onNewPlayer (data) {
    util.log('Creating new player...', data)

    // Create a new player
    var newPlayer = new Player(data.x, data.y)
    newPlayer.id = this.id
    newPlayer.clientId = data.clientId

    // Broadcast new player to connected socket clients
    currentSocket.broadcast.emit('new player', {
        clientId: newPlayer.clientId,
        id: newPlayer.id,
        x: newPlayer.x,
        y: newPlayer.y
    })

    // Send existing players to the new player
    var i, existingPlayer
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i]
        io.emit('new player', {
            clientId: existingPlayer.clientId,
            id: existingPlayer.id,
            x: existingPlayer.x,
            y: existingPlayer.y
        })
    }

    // Add new player to the players array
    players.push(newPlayer)
}

// Player has moved
function onMovePlayer (data) {
    // Find player in array
    var movePlayer = playerById(this.id)

    // Player not found
    if (!movePlayer) {
        util.log('Player not found: ' + this.id)
        return
    }

    // Update player position
    movePlayer.x = data.x
    movePlayer.y = data.y

    // Broadcast updated position to connected socket clients
    io.emit('move player', {
        id: movePlayer.id,
        clientId: movePlayer.clientId,
        x: movePlayer.x,
        y: movePlayer.y
    })
}

function playerById (id) {
    var i
    for (i = 0; i < players.length; i++) {
        if (players[i].id === id) {
            return players[i]
        }
    }

    return false
}
