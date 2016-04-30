'use strict'

let util = require('util')
let hri = require('human-readable-ids').hri
let _ = require('lodash')

let Player = require('./services/Player')
let PlayerById = require('./services/PlayerById')
let rooms = {}
let io = null

module.exports = function(ioInstance) {
    io = ioInstance
    setEventHandlers()
}

function setEventHandlers() {
    io.on('connection', onSocketConnection.bind(this))
}

setInterval(function() {
    util.log('Current rooms', JSON.stringify(rooms))

    Object.keys(rooms).forEach((roomId) => {
        util.log(rooms[roomId].players)
        rooms[roomId].players.forEach((player) => {
            if (io.sockets.sockets[player.id] === undefined){
                rooms[roomId].players.splice(rooms[roomId].players.indexOf(player), 1)
                util.log('Removing player', player.id)
            }
        })
    })
}, 10000)

// New socket connection
function onSocketConnection(socket) {
    util.log('New player has connected: ' + socket.id)

    socket.on('disconnect', onClientDisconnect)
    socket.on('new player', onNewPlayer)
    socket.on('move player', onMovePlayer)

    socket.on('player damaged', onPlayerDamaged)
    socket.on('player full health', onPlayerFullHealth)
    socket.on('player healing', onPlayerHealing)

    socket.on('bullet fired', onBulletFired)
    socket.on('bullet removed', onBulletRemoved)

    socket.on('player update nickname', onPlayerUpdateNickname)
}

function onPlayerUpdateNickname(data) {
    let nickname = data.nickname
    var player = PlayerById(data.roomId, this.id, rooms)

    if (! player) {
        util.log('Player not found when updating nickname: ' + this.id)
        return
    }

    if (nickname.length > 25)
        nickname = nickname.splice(0, 25)

    player.meta.nickname = nickname

    io.to(data.roomId).emit('update players', {
        room: rooms[data.roomId]
    })
}

// New player has joined
function onNewPlayer (data) {
    util.log('Creating new player...', data)

    var player = PlayerById(data.roomId, this.id, rooms)
    if (player) {
        util.log('Player already in room: ' + this.id)
        return
    }

    // Create a new player
    var newPlayer = Player(data.x, data.y)
    newPlayer.id = this.id
    newPlayer.meta = {
        health: 100,
        score: 0
    }

    if (data.roomId) {
        if (!rooms[data.roomId]) {
            rooms[data.roomId] = {
                id: data.roomId,
                players: [newPlayer]
            }
        }
        rooms[data.roomId].players.push(newPlayer)
        this.join(data.roomId)
        io.to(data.roomId).emit('update players', {
            room: rooms[data.roomId]
        })
        return
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

        util.log('Created new room', newRoom)
        this.join(newRoomId)
        io.to(newRoomId).emit('update players', {
            room: rooms[newRoomId]
        })
    } else {
        util.log('Adding player to', availableRooms[0])
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
    var movePlayer = PlayerById(data.roomId, this.id, rooms)

    // Player not found
    if (!movePlayer) {
        util.log('Player not found when moving: ' + this.id)
        return
    }

    // Update player position
    movePlayer.x = data.x
    movePlayer.y = data.y
    movePlayer.rightArmAngle = data.rightArmAngle
    movePlayer.leftArmAngle = data.leftArmAngle
    movePlayer.facing = data.facing
    movePlayer.lastMovement = Math.floor(Date.now() / 1000)

    // Broadcast updated position to connected socket clients
    io.to(data.roomId).emit('move player', {
        id: movePlayer.id,
        x: data.x,
        y: data.y,
        rightArmAngle: data.rightArmAngle,
        leftArmAngle: data.leftArmAngle,
        facing: data.facing,
        lastMovement: data.lastMovement,
        respawnInProgress: data.respawnInProgress
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

    var removePlayer = PlayerById(selectedRoomId, this.id, rooms)

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

function onPlayerFullHealth(data) {
    util.log('Player full health')
    let player = PlayerById(data.roomId, this.id, rooms)
    player.meta.health = 100

    io.to(data.roomId).emit('player health update', {
        id: this.id,
        health: player.meta.health
    })
}

function onPlayerHealing(data) {
    util.log('Player is healing')
    let player = PlayerById(data.roomId, this.id, rooms)
    player.meta.health += 10

    if (player.meta.health > 100)
        player.meta.health = 100

    io.to(data.roomId).emit('player health update', {
        id: this.id,
        health: player.meta.health
    })
}

function onPlayerDamaged(data) {
    util.log('Player damaged...', data)

    let player = PlayerById(data.roomId, this.id, rooms)
    player.meta.health -= Number(data.damage)

    if (player.meta.health <= 0) {
        util.log('Respawning player...', data)
        player.meta.health = 100

        if (player.meta.score > 9) {
            player.meta.score -= 10
        } else {
            player.meta.score = 0
        }

        io.to(data.roomId).emit('player respawn', {
            id: this.id,
            damagedPlayerId: data.damagedPlayerId,
            health: 100
        })

        let attackingPlayer = PlayerById(data.roomId, data.attackingPlayerId, rooms)
        if (attackingPlayer) {
            attackingPlayer.meta.score += 10
        } else {
            util.log(data.damagedPlayerId, 'fell to his death.')
        }

        io.to(data.roomId).emit('update players', {
            room: rooms[data.roomId]
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
    if (!data.bulletId) {
        console.error('Bullet id missing when removing bullet...', data)
        return
    }

    data.id = this.id
    util.log('Removing bullet...', data)
    io.to(data.roomId).emit('bullet removed', data)
}
