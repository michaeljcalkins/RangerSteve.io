'use strict'

let util = require('util')

let Player = require('./Player')
let players = []
let io = null
let currentSocket = null

module.exports = function(ioInstance) {
    io = ioInstance
    setEventHandlers()
}

function setEventHandlers() {
    io.on('connection', onSocketConnection.bind(this))
}

setInterval(function() {
    console.log('Current players', players)
}, 10000)

// New socket connection
function onSocketConnection(socket) {
    currentSocket = socket
    util.log('New player has connected: ' + socket.id)

    socket.on('disconnect', onClientDisconnect)
    socket.on('new player', onNewPlayer)
    socket.on('move player', onMovePlayer)

    socket.on('player damaged', onPlayerDamaged)

    socket.on('bullet fired', onBulletFired)
    socket.on('bullet removed', onBulletRemoved)
}

function onPlayerDamaged(data) {
    util.log('Player damaged...', data)

    let player = playerById(this.id)
    player.meta.health -= Number(data.damage)

    if (player.meta.health <= 0) {
        util.log('Respawning player...', data)
        player.meta.health = 100

        io.emit('player respawn', {
            id: this.id,
            damagedPlayerId: data.damagedPlayerId,
            health: 100
        })

        return
    }

    io.emit('player damaged', {
        id: this.id,
        damagedPlayerId: data.damagedPlayerId,
        damage: data.damage,
        health: player.meta.health
    })
}

function onBulletFired(data) {
    util.log('Creating new bullet...', data)
    data.id = this.id
    io.emit('bullet fired', data)
}

function onBulletRemoved(data) {
    util.log('Bullet removed: ' + JSON.stringify(data))
    data.id = this.id
    io.emit('bullet removed', data)
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
    io.emit('update players', { players })
}

// New player has joined
function onNewPlayer (data) {
    util.log('Creating new player...', data)

    // Create a new player
    var newPlayer = Player(data.x, data.y)
    newPlayer.id = this.id
    newPlayer.meta = {
        health: 100
    }

    // Add new player to the players array
    players.push(newPlayer)

    io.emit('update players', { players })
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
