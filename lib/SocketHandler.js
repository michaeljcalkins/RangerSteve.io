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

    socket.on('damaged player', onDamagedPlayer)
}

function onDamagedPlayer(data) {
    // Find player in array
    var damagedPlayer = playerById(data.playerId)

    // Player not found
    if (!damagedPlayer) {
        util.log('Player not found: ' + this.id)
        return
    }

    console.log(damagedPlayer.health)
    damagedPlayer.health -= +data.damage
    util.log('Player damaged', damagedPlayer.health, data.playerId)

    if (damagedPlayer.health <= 0) {
        console.log('Player killed:', damagedPlayer.health, data.playerId, damagedPlayer.clientId)
        // Broadcast updated position to connected socket clients
        currentSocket.broadcast.to(data.playerId).emit('dead player')
        damagedPlayer.health = 100
    }
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
    newPlayer.health = 100

    // Broadcast new player to connected socket clients
    currentSocket.broadcast.emit('new player', {
        health: newPlayer.health,
        clientId: newPlayer.clientId,
        id: newPlayer.id,
        x: newPlayer.getX(),
        y: newPlayer.getY()
    })

    // Send existing players to the new player
    var i, existingPlayer
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i]
        io.emit('new player', {
            health: 100,
            clientId: existingPlayer.clientId,
            id: existingPlayer.id,
            x: existingPlayer.getX(),
            y: existingPlayer.getY()
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
    movePlayer.setX(data.x)
    movePlayer.setY(data.y)

    // Broadcast updated position to connected socket clients
    io.emit('move player', {
        id: movePlayer.id,
        clientId: movePlayer.clientId,
        x: movePlayer.getX(),
        y: movePlayer.getY()
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
