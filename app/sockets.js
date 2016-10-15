'use strict'

const util = require('util')
const hri = require('human-readable-ids').hri
const _ = require('lodash')
const moment = require('moment')

const Player = require('./services/Player')
const PlayerById = require('./services/PlayerById')
const Room = require('./services/Room')

let rooms = {}
let io = null

const MAX_ROOM_SIZE = 7
const RESPAWN_TIME_SECONDS = 5
const ROUND_LENGTH_MINUTES = 5
const PLAYER_FULL_HEALTH = 100
const MAP_IDS = ['PunkFallout', 'HighRuleJungle', 'DarkForest', 'PunkCity', 'PunkLoop']

function init(ioInstance) {
    io = ioInstance
    io.on('connection', (socket) => {
        util.log('New connection from ' + socket.request.connection.remoteAddress)

        socket.on('disconnect', onClientDisconnect)
        socket.on('new player', onNewPlayer)
        socket.on('move player', onMovePlayer)

        socket.on('player damaged', onPlayerDamaged)
        socket.on('player full health', onPlayerFullHealth)
        socket.on('player healing', onPlayerHealing)
        socket.on('player adjust score', onPlayerAdjustScore)
        socket.on('player update nickname', onPlayerUpdateNickname)

        socket.on('message send', onMessageSend)

        socket.on('bullet fired', onBulletFired)
        socket.on('kick player', onKickPlayer)
        socket.on('load complete', onLoadComplete)
    })
}

function respawnPlayer(player, attackingPlayer, socketId, roomId) {
    setTimeout(() => {
        player.meta.health = PLAYER_FULL_HEALTH

        io.to(roomId).emit('player respawn', {
            id: socketId,
            damagedPlayerId: player.id,
            health: PLAYER_FULL_HEALTH
        })

        player.meta.damageStats.attackingPlayerId = null
        player.meta.damageStats.attackingDamage = 0
        player.meta.damageStats.attackingHits = 0

        if (_.get(attackingPlayer, 'meta.damageStats.attackingPlayerId') === player.id) {
            attackingPlayer.meta.damageStats.attackingPlayerId = null
            attackingPlayer.meta.damageStats.attackingDamage = 0
            attackingPlayer.meta.damageStats.attackingHits = 0
        }
    }, RESPAWN_TIME_SECONDS * 1000)
}

setInterval(function() {
    Object.keys(rooms).forEach((roomId) => {
        if (rooms[roomId].roundStartTime <= moment().unix() && rooms[roomId].state === 'ended') {
            util.log('Restarting round for', roomId)
            const previousMap = rooms[roomId].map

            rooms[roomId] = new Room({
                id: roomId,
                players: rooms[roomId].players,
                roundLength: ROUND_LENGTH_MINUTES,
                messages: rooms[roomId].messages
            })

            const potentialNextMaps = [
                'PunkFallout',
                'HighRuleJungle',
                'DarkForest',
                'PunkCity',
                'PunkLoop'
            ].filter(map => map !== previousMap)

            rooms[roomId].map = _.sample(potentialNextMaps)

            util.log(rooms[roomId].map, 'has been selected for ', roomId)

            Object.keys(rooms[roomId].players).forEach((playerId) => {
                rooms[roomId].players[playerId].meta.health = PLAYER_FULL_HEALTH
                rooms[roomId].players[playerId].meta.deaths = 0
                rooms[roomId].players[playerId].meta.kills = 0
                rooms[roomId].players[playerId].meta.bestKillingSpree = 0
                rooms[roomId].players[playerId].meta.killingSpree = 0
                rooms[roomId].players[playerId].meta.movement = 0
                rooms[roomId].players[playerId].meta.bulletsFired = 0
                rooms[roomId].players[playerId].meta.bulletsHit = 0
                rooms[roomId].players[playerId].meta.score = 0
                rooms[roomId].players[playerId].meta.headshots = 0
            })

            io.to(roomId).emit('update players', {
                room: rooms[roomId]
            })
        }

        if (rooms[roomId].roundEndTime <= moment().unix() && rooms[roomId].state === 'active') {
            util.log('Round has ended for', roomId)
            rooms[roomId].state = 'ended'
            rooms[roomId].roundStartTime = moment().add(10, 'seconds').unix()
            io.to(roomId).emit('update players', {
                room: rooms[roomId]
            })
        }
    })
}, 1000)

function onLoadComplete(data) {
    io.to(data.roomId).emit('update players', {
        room: rooms[data.roomId]
    })
}

function onKickPlayer(data) {
    let players = _.values(rooms[data.roomId].players)
    let player = _.find(players, { meta: { nickname: data.nickname } })
    if (! player) {
        util.error('Could not find player.')
    }

    io.to(data.roomId).emit('kick player', {
        id: player.id,
        roomId: data.roomId
    })
}

function onMessageSend(data) {
    rooms[data.roomId].messages.push(data)
    rooms[data.roomId].messages = rooms[data.roomId].messages.slice(-5)
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
    util.log('Creating new player...', data, this.id)

    // Check for duplicate players
    var player = PlayerById(data.roomId, this.id, rooms)
    if (player) return util.log('Player already in room: ' + this.id)

    // Create a new player
    var newPlayer = new Player(this.id, data.x, data.y)

    newPlayer.meta = {
        health: PLAYER_FULL_HEALTH,
        kills: 0,
        deaths: 0,
        bestKillingSpree: 0,
        score: 0,
        nickname: data.nickname,
        killingSpree: 0,
        headshots: 0,
        damageInflicted: 0,
        movement: 0,
        bulletsFired: 0,
        bulletsHit: 0,
        weaponId: data.weaponId
    }

    // Specified room id and room has not been created
    if (data.roomId && ! rooms[data.roomId]) {
        util.log('Specified room does not exist and is being created')
        rooms[data.roomId] = new Room({
            id: data.roomId,
            player: newPlayer,
            roundLength: ROUND_LENGTH_MINUTES
        })

        if (data.map && MAP_IDS.indexOf(data.map) > -1) {
            rooms[data.roomId].map = data.map
        }

        rooms[data.roomId].players[this.id] = newPlayer

        this.join(data.roomId)

        io.to(data.roomId).emit('load game', {
            room: rooms[data.roomId]
        })

        io.to(data.roomId).emit('update players', {
            room: rooms[data.roomId]
        })
        return
    }

    // Specified room id and room has been created
    if (
        data.roomId &&
        rooms[data.roomId]
    ) {
        util.log('Specified room does existing and has room for player')
        rooms[data.roomId].players[this.id] = newPlayer

        this.join(data.roomId)

        io.to(data.roomId).emit('load game', {
            room: rooms[data.roomId]
        })

        io.to(data.roomId).emit('update players', {
            room: rooms[data.roomId]
        })
        return
    }

    // Find available room with space for player
    let availableRooms = Object.keys(rooms).filter(function(room) {
        if (! rooms[room].players) return true
        return Object.keys(rooms[room].players).length < MAX_ROOM_SIZE
    })

    // No available rooms were found so we create one.
    if (availableRooms.length <= 0) {
        util.log('No rooms available, creating new room to add player')
        let newRoomId = hri.random()
        rooms[newRoomId] = new Room({
            id: newRoomId,
            player: newPlayer,
            roundLength: ROUND_LENGTH_MINUTES
        })

        this.join(newRoomId)

        io.to(newRoomId).emit('load game', {
            room: rooms[newRoomId]
        })

        io.to(newRoomId).emit('update players', {
            room: rooms[newRoomId]
        })
        return
    }

    util.log('Adding player to first available room')
    rooms[availableRooms[0]].players[newPlayer.id] = newPlayer
    this.join(availableRooms[0])

    setTimeout(() => {
        io.to(rooms[availableRooms[0]].id).emit('load game', {
            room: rooms[availableRooms[0]]
        })

        io.to(availableRooms[0]).emit('update players', {
            room: rooms[availableRooms[0]]
        })
    }, 1000)
}

// Player has moved
function onMovePlayer (data) {
    if (! rooms[data.roomId]) return

    var movePlayer = rooms[data.roomId].players[this.id]

    if (! movePlayer || movePlayer.meta.health <= 0) return

    // Update player position
    movePlayer.x = data.x
    movePlayer.y = data.y
    movePlayer.rightArmAngle = data.rightArmAngle
    movePlayer.leftArmAngle = data.leftArmAngle
    movePlayer.facing = data.facing
    movePlayer.meta.movement++

    // Broadcast updated position to connected socket clients
    io.to(data.roomId).emit('move player', {
        id: this.id,
        x: data.x,
        y: data.y,
        rightArmAngle: data.rightArmAngle,
        leftArmAngle: data.leftArmAngle,
        facing: data.facing,
        flying: data.flying,
        shooting: data.shooting,
        health: movePlayer.meta.health,
        weaponId: data.weaponId
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
    if (! removePlayer) {
        util.log('Player not found when disconnecting: ' + this.id)
        return
    }

    // Remove player from players array
    Object.keys(rooms).forEach((roomId) => {
        delete rooms[roomId].players[this.id]
    })

    // Broadcast removed player to connected socket clients
    io.to(selectedRoomId).emit('update players', {
        room: rooms[selectedRoomId]
    })
}

function onPlayerFullHealth(data) {
    let player = PlayerById(data.roomId, this.id, rooms)
    player.meta.health = PLAYER_FULL_HEALTH

    io.to(data.roomId).emit('player health update', {
        id: this.id,
        health: player.meta.health
    })
}

function onPlayerHealing(data) {
    let player = PlayerById(data.roomId, this.id, rooms)
    player.meta.health += 10

    if (player.meta.health > PLAYER_FULL_HEALTH)
        player.meta.health = PLAYER_FULL_HEALTH

    io.to(data.roomId).emit('player health update', {
        id: this.id,
        health: player.meta.health
    })
}

function onPlayerDamaged(data) {
    let player = PlayerById(data.roomId, data.damagedPlayerId, rooms)

    if (! player || player.meta.health <= 0) return

    player.meta.health -= Number(data.damage)
    player.meta.damageStats = player.meta.damageStats || {}

    if (player.meta.damageStats.attackingPlayerId !== data.attackingPlayerId) {
        player.meta.damageStats.attackingPlayerId = data.attackingPlayerId
        player.meta.damageStats.attackingDamage = 0
        player.meta.damageStats.attackingHits = 0
    }

    player.meta.damageStats.attackingDamage += data.damage
    player.meta.damageStats.attackingHits++
    player.meta.damageStats.weaponId = data.weaponId

    const attackingPlayer = PlayerById(data.roomId, data.attackingPlayerId, rooms)
    if (attackingPlayer) {
        attackingPlayer.meta.bulletsHit++
    }

    // Player was killed when shot
    if (player.meta.health <= 0) {
        player.meta.health = 0
        player.meta.killingSpree = 0
        player.meta.deaths++
        player.meta.canRespawnTimestamp = moment().add(RESPAWN_TIME_SECONDS, 'seconds').unix()

        if (attackingPlayer) {
            attackingPlayer.meta.score += 10
            attackingPlayer.meta.kills++
            attackingPlayer.meta.killingSpree++
            attackingPlayer.meta.damageInflicted += Number(data.damage)

            if (data.wasHeadshot) attackingPlayer.meta.headshots++

            if (attackingPlayer.meta.killingSpree > attackingPlayer.meta.bestKillingSpree) {
                attackingPlayer.meta.bestKillingSpree = attackingPlayer.meta.killingSpree
            }

            io.to(data.roomId).emit('player kill confirmed', {
                id: attackingPlayer.id,
                damagedPlayerId: data.damagedPlayerId,
                killingSpree: attackingPlayer.meta.killingSpree,
                wasHeadshot: data.wasHeadshot
            })

            io.to(data.roomId).emit('player kill log', {
                deadNickname: player.meta.nickname,
                attackerNickname: attackingPlayer.meta.nickname,
                weaponId: data.weaponId,
                wasHeadshot: data.wasHeadshot
            })
        } else {
            if (player.meta.score >= 10) {
                player.meta.score -= 10
            }

            io.to(data.roomId).emit('player kill log', {
                deadNickname: player.meta.nickname
            })
        }

        const attackingDamageStats = _.get(attackingPlayer, 'meta.damageStats.attackingPlayerId') === player.id
            ? _.get(attackingPlayer, 'meta.damageStats', {})
            : {}

        io.to(data.roomId).emit('player damaged', {
            id: this.id,
            damagedPlayerId: data.damagedPlayerId,
            damage: data.damage,
            health: player.meta.health,
            damageStats: player.meta.damageStats,
            attackingDamageStats,
            canRespawnTimestamp: player.meta.canRespawnTimestamp,
            playerX: player.x,
            playerY: player.y
        })

        respawnPlayer(player, attackingPlayer, this.id, data.roomId)

        io.to(data.roomId).emit('update players', {
            room: rooms[data.roomId]
        })
        return
    }

    io.to(data.roomId).emit('player damaged', {
        id: this.id,
        damagedPlayerId: data.damagedPlayerId,
        damage: data.damage,
        health: player.meta.health,
        damageStats: {},
        attackingDamageStats: {}
    })
}

function onBulletFired(data) {
    data.id = this.id

    const player = PlayerById(data.roomId, data.id, rooms)

    if (! player || player.meta.health <= 0) return
    player.meta.bulletsFired++

    io.to(data.roomId).emit('bullet fired', data)
}

module.exports.init = init
