'use strict'

let util = require('util')
let hri = require('human-readable-ids').hri
let _ = require('lodash')
let moment = require('moment')

let Player = require('./services/Player')
let PlayerById = require('./services/PlayerById')
let Notification = require('./services/Notification')

let rooms = {}
let io = null

function sockets(ioInstance) {
    io = ioInstance
    setEventHandlers()
}

function setEventHandlers() {
    io.on('connection', onSocketConnection.bind(this))
}

// setInterval(function() {
//     Object.keys(rooms).forEach((key) => {
//         util.log('ROOM >>>>>>>>>>>>>>>>', JSON.stringify(rooms[key], null, 4))
//     })
// }, 10000)

setInterval(function() {
    Object.keys(rooms).forEach((roomId) => {
        if (rooms[roomId].roundEndTime <= moment().unix()) {
            rooms[roomId].state = 'ended'
            io.to(roomId).emit('update players', {
                room: rooms[roomId]
            })
        }
    })
}, 1000)

setInterval(function() {
    Object.keys(rooms).forEach((roomId) => {
        rooms[roomId].players.forEach((player) => {
            if (io.sockets.sockets[player.id] === undefined){
                rooms[roomId].players.splice(rooms[roomId].players.indexOf(player), 1)
                util.log('Removing player', player.id)
            }
        })
    })
}, 3000)

// New socket connection
function onSocketConnection(socket) {
    util.log('New player has connected: ' + socket.id)

    socket.on('disconnect', onClientDisconnect)
    socket.on('new player', onNewPlayer)
    socket.on('move player', onMovePlayer)

    socket.on('player damaged', onPlayerDamaged)
    socket.on('player full health', onPlayerFullHealth)
    socket.on('player healing', onPlayerHealing)
    socket.on('player adjust score', onPlayerAdjustScore)
    socket.on('player update nickname', onPlayerUpdateNickname)
    socket.on('player update weapon', onPlayerUpdateWeapon)

    socket.on('message send', onMessageSend)

    socket.on('bullet fired', onBulletFired)
}

function onPlayerUpdateWeapon(data) {
    io.to(data.roomId).emit('player update weapon', data)
}

function onMessageSend(data) {
    io.to(data.roomId).emit('message received', data)
}

function onPlayerAdjustScore(data) {
    var player = PlayerById(data.roomId, this.id, rooms)

    if (! player) {
        util.log('Player not found when adjust score', data)
        return
    }

    player.meta.score += data.amount
    player.meta.score = player.meta.score <= 0 ? 0 : player.meta.score

    io.to(data.roomId).emit('update players', {
        room: rooms[data.roomId]
    })
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

    util.log('Adding player to room', this.id)

    // Create a new player
    var newPlayer = Player(data.x, data.y)
    newPlayer.id = this.id

    newPlayer.meta = {
        health: 100,
        kills: 0,
        deaths: 0,
        bestKillingSpree: 0,
        score: 0,
        nickname: data.nickname,
        killingSpree: 0,
        currentWeaponMeta: data.currentWeaponMeta
    }

    if (process.env.NODE_ENV === 'production') {
        Notification({
            app_id: '073be8f0-feda-43ea-965a-07a63e485527',
            contents: { 'en': 'A player has started playing!' },
            headings: { 'en': 'Ranger Steve: Buffalo Invasion' },
            url: 'https://rangersteve.io/game',
            included_segments: ['All']
        })
    }

    if (data.roomId) {
        if (! rooms[data.roomId]) {
            rooms[data.roomId] = {
                id: data.roomId,
                players: [newPlayer],
                // roundEndTime: moment().add(5, 'minutes').unix(),
                roundEndTime: moment().add(10, 'seconds').unix(),
                state: 'active'
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

    if (movePlayer.meta.health <= 0) return

    // Player not found
    if (! movePlayer) {
        util.log('Player not found when moving: ' + this.id)
        io.to(data.roomId).emit('player remove', {
            id: this.id
        })
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
        health: movePlayer.meta.health
    })
}

// Socket client has disconnected
function onClientDisconnect() {
    util.log('Player has disconnected: ' + this.id)

    let selectedRoomId = null
    Object.keys(rooms).forEach((roomId) => {
        if (_.find(rooms[roomId].players, { id: this.id })) {
            selectedRoomId = roomId
        }
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
    let player = PlayerById(data.roomId, this.id, rooms)
    player.meta.health = 100

    io.to(data.roomId).emit('player health update', {
        id: this.id,
        health: player.meta.health
    })
}

function onPlayerHealing(data) {
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
    let player = PlayerById(data.roomId, data.damagedPlayerId, rooms)

    if (! player || player.meta.health <= 0){
        return
    }

    player.meta.health -= Number(data.damage)

    // Player was killed when shot
    if (player.meta.health <= 0) {
        player.meta.health = 0
        player.meta.killingSpree = 0

        // Falling to your death causes a score loss
        if (data.damage === 1000 && player.meta.score >= 10) {
            player.meta.score -= 10
            player.meta.deaths++
        }

        let attackingPlayer = PlayerById(data.roomId, data.attackingPlayerId, rooms)
        if (attackingPlayer) {
            attackingPlayer.meta.score += 10
            attackingPlayer.meta.kills++
            attackingPlayer.meta.killingSpree++
            
            if (attackingPlayer.meta.killingSpree > attackingPlayer.meta.bestKillingSpree) {
                attackingPlayer.meta.bestKillingSpree = attackingPlayer.meta.killingSpree
            }

            io.to(data.roomId).emit('player kill confirmed', {
                id: attackingPlayer.id,
                score: 10,
                killingSpree: attackingPlayer.meta.killingSpree
            })

            io.to(data.roomId).emit('player kill log', {
                deadNickname: player.meta.nickname,
                attackerNickname: attackingPlayer.meta.nickname,
                weaponId: data.weaponId
            })
        }

        io.to(data.roomId).emit('player damaged', {
            id: this.id,
            damagedPlayerId: data.damagedPlayerId,
            damage: data.damage,
            health: player.meta.health
        })

        setTimeout(() => {
            player.meta.health = 100

            io.to(data.roomId).emit('player respawn', {
                id: this.id,
                damagedPlayerId: data.damagedPlayerId,
                health: 100
            })
        }, 3000)

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
    data.id = this.id
    io.to(data.roomId).emit('bullet fired', data)
}

module.exports.rooms = rooms
module.exports.init = sockets
