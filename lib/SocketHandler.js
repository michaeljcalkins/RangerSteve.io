'use strict'

let util = require('util')
let hri = require('human-readable-ids').hri
let _ = require('lodash')

let Player = require('./Player')
let rooms = {}
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
    console.log('Current rooms', rooms)
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

// New player has joined
function onNewPlayer (data) {
    util.log('Creating new player...', data)

    // Create a new player
    var newPlayer = Player(data.x, data.y)
    newPlayer.id = this.id
    newPlayer.meta = {
        health: 100
    }

    let availableRooms = Object.keys(rooms).filter(function(room) {
        if (!room.players) return true
        return room.players.length < 10
    })

    if (availableRooms.length <= 0) {
        // create a new room
        let newRoomId = hri.random()
        let newRoom = {
            id: newRoomId,
            players: [newPlayer]
        }
        rooms[newRoomId] = newRoom

        console.log('Created new room', newRoom)
        this.join(newRoomId)
        io.to(newRoomId).emit('update players', {
            room: rooms[newRoomId]
        })
    } else {
        console.log('Adding player to', availableRooms[0])
        rooms[availableRooms[0]].players.push(newPlayer)
        this.join(availableRooms[0])
        io.to(availableRooms[0]).emit('update players', {
            room: rooms[availableRooms[0]]
        })
        return
    }
}

// Player has moved
function onMovePlayer (data) {
    // Find player in array
    var movePlayer = playerById(data.roomId, this.id)

    // Player not found
    if (!movePlayer) {
        util.log('Player not found when moving: ' + this.id)
        return
    }

    // Update player position
    movePlayer.x = data.x
    movePlayer.y = data.y

    // Broadcast updated position to connected socket clients
    io.to(data.roomId).emit('move player', {
        id: movePlayer.id,
        x: movePlayer.x,
        y: movePlayer.y
    })
}

// Socket client has disconnected
function onClientDisconnect() {
    util.log('Player has disconnected: ' + this.id)

    let selectedRoomId = null
    Object.keys(rooms).forEach((roomId) => {
        if (_.find(rooms[roomId].players, { id: this.id }))
            selectedRoomId = roomId
    })

    var removePlayer = playerById(selectedRoomId, this.id)

    // Player not found
    if (!removePlayer) {
        util.log('Player not found when disconnecting: ' + this.id)
        return
    }

    // Remove player from players array
    Object.keys(rooms).forEach((roomId) => {
        rooms[roomId].players.splice(rooms[roomId].players.indexOf(removePlayer), 1)
    })

    // Broadcast removed player to connected socket clients
    io.to(selectedRoomId).emit('update players', {
        room: rooms[selectedRoomId]
    })
}

function onPlayerDamaged(data) {
    util.log('Player damaged...', data)

    let player = playerById(data.roomId, this.id)
    player.meta.health -= Number(data.damage)

    if (player.meta.health <= 0) {
        util.log('Respawning player...', data)
        player.meta.health = 100

        io.to(data.roomId).emit('player respawn', {
            id: this.id,
            damagedPlayerId: data.damagedPlayerId,
            health: 100
        })

        return
    }

    io.to(data.roomId).emit('player damaged', {
        id: this.id,
        damagedPlayerId: data.damagedPlayerId,
        damage: data.damage,
        health: player.meta.health
    })
}

function onBulletFired(data) {
    util.log('Creating new bullet...', data)
    data.id = this.id
    io.to(data.roomId).emit('bullet fired', data)
}

function onBulletRemoved(data) {
    util.log('Bullet removed: ' + JSON.stringify(data))
    data.id = this.id
    io.to(data.roomId).emit('bullet removed', data)
}

function playerById (roomId, id) {
    if (!_.has(rooms, `[${roomId}].players`))
        return false

    return _.find(rooms[roomId].players, { id })
}
