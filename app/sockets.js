'use strict'

const util = require('util')
const _ = require('lodash')
const moment = require('moment')
const filter = require('profanity-filter')
const gameloop = require('node-gameloop')

const Server = require('./Server')

const GameConsts = require('../lib/GameConsts')
const helpers = require('../lib/helpers')
const createPlayer = require('./services/createPlayer')
const getPlayerById = require('./services/getPlayerById')
const getTeam = require('./services/getTeam')
const createRoom = require('./services/createRoom')
const getRoomIdByPlayerId = require('./services/getRoomIdByPlayerId')
// const bulletSchema = require('../lib/schemas/bulletSchema')
// const playerIdSchema = require('../lib/schemas/playerIdSchema')
// const playerFromClientSchema = require('../lib/schemas/playerFromClientSchema')

filter.seed(require('./seeds/profanity.json'))
filter.setReplacementMethod('grawlix')

const NetworkStats = helpers.NetworkStats
const sizeOf = helpers.sizeOf

let rooms = {}
let io = null

const events = {
    [GameConsts.EVENT.NEW_PLAYER]: onNewPlayer,
    [GameConsts.EVENT.MOVE_PLAYER]: onMovePlayer,
    [GameConsts.EVENT.PLAYER_DAMAGED]: onPlayerDamaged,
    [GameConsts.EVENT.PLAYER_FULL_HEALTH]: onPlayerFullHealth,
    [GameConsts.EVENT.PLAYER_HEALING]: onPlayerHealing,
    [GameConsts.EVENT.PLAYER_ADJUST_SCORE]: onPlayerAdjustScore,
    [GameConsts.EVENT.PLAYER_RESPAWN]: onPlayerRespawn,
    [GameConsts.EVENT.PLAYER_UPDATE_NICKNAME]: onPlayerUpdateNickname,
    [GameConsts.EVENT.MESSAGE_SEND]: onMessageSend,
    [GameConsts.EVENT.BULLET_FIRED]: onBulletFired,
    [GameConsts.EVENT.KICK_PLAYER]: onKickPlayer,
    // [GameConsts.EVENT.LOAD_COMPLETE]: onLoadComplete,
    [GameConsts.EVENT.REFRESH_ROOM]: onRefreshRoom,
}

let dataReceived = 0

function init(primusInstance) {
    io = primusInstance
    Server.init(io)
    io.on('connection', (socket) => {
        util.log('New connection: ' + socket.id + ', ' + JSON.stringify(socket.address))

        socket.on('data', (data) => {
            dataReceived += sizeOf(data)
            // console.log('* LOG * data', data.type, data.payload)
            if (! data || ! data.type) return

            if (! events[data.type]) return

            events[data.type].call(socket, data.payload)
        })
    })

    io.on('disconnection', (socket) => {
        onClientDisconnect.call(socket)
    })

    // if (GameConsts.ENABLE_NETWORK_STATS) {
    //     NetworkStats.loop(() => {
    //         const dataSent = Server.getStats().dataSent
    //         NetworkStats.print(dataSent, dataReceived)
    //     })
    // }
}

function getRooms() {
    return rooms
}

gameloop.setGameLoop(function() {
    Object.keys(rooms).forEach((roomId) => {
        Server.sendToRoom(
            roomId,
            GameConsts.EVENT.REFRESH_ROOM,
            rooms[roomId]
        )
    })
}, GameConsts.TICK_RATE)

setInterval(function() {
    Object.keys(rooms).forEach((roomId) => {
        // Room was likely deleted when the last player left
        if (! rooms[roomId]) return

        // Round has ended and is restarting now
        if (rooms[roomId].roundStartTime <= moment().unix() && rooms[roomId].state === 'ended') {
            util.log('Restarting round for', roomId)
            const previousMap = rooms[roomId].map
            const previousGamemode = rooms[roomId].gamemode

            // Randomly select a map that was not the previous map
            const potentialNextMaps = GameConsts.MAPS.filter(map => map !== previousMap)
            const potentialNextGamemodes = GameConsts.GAMEMODES.filter(gamemode => gamemode !== previousGamemode)

            const nextMap = _.sample(potentialNextMaps)
            const nextGamemode = _.sample(potentialNextGamemodes)

            rooms[roomId] = createRoom({
                id: roomId,
                players: rooms[roomId].players,
                messages: rooms[roomId].messages,
                map: nextMap,
                gamemode: nextGamemode,
            })

            util.log(`${rooms[roomId].map} has been selected to play ${rooms[roomId].gamemode} for room ${roomId}`)

            Object.keys(rooms[roomId].players).forEach((playerId) => {
                rooms[roomId].players[playerId].meta.health = GameConsts.PLAYER_FULL_HEALTH
                rooms[roomId].players[playerId].meta.deaths = 0
                rooms[roomId].players[playerId].meta.kills = 0
                rooms[roomId].players[playerId].meta.bestKillingSpree = 0
                rooms[roomId].players[playerId].meta.killingSpree = 0
                rooms[roomId].players[playerId].meta.bulletsFired = 0
                rooms[roomId].players[playerId].meta.bulletsHit = 0
                rooms[roomId].players[playerId].meta.score = 0
                rooms[roomId].players[playerId].meta.headshots = 0
                rooms[roomId].players[playerId].meta.secondsInRound = 0
            })

            Server.sendToRoom(
                roomId,
                GameConsts.EVENT.LOAD_GAME,
                {
                    room: rooms[roomId],
                }
            )
            return
        }

        // Round has ended and setting the time the next round will start at
        if (rooms[roomId].roundEndTime <= moment().unix() && rooms[roomId].state === 'active') {
            util.log('Round has ended for', roomId)
            rooms[roomId].state = 'ended'
            rooms[roomId].roundStartTime = moment().add(GameConsts.END_OF_ROUND_BREAK_SECONDS, 'seconds').unix()

            // Server.sendToRoom(
            //     roomId,
            //     GameConsts.EVENT.UPDATE_PLAYERS,
            //     {
            //         room: rooms[roomId],
            //     }
            // )
            return
        }

        Object.keys(rooms[roomId].players).forEach((playerId) => {
            rooms[roomId].players[playerId].meta.secondsInRound++
        })
    })
}, 1000)

function onPlayerRespawn() {
    const roomId = getRoomIdByPlayerId(this.id, rooms)
    const player = getPlayerById(roomId, this.id, rooms)

    if (! player) {
        util.log('Player not found when trying to respawn', this.id)
        return
    }

    player.meta.health = GameConsts.PLAYER_FULL_HEALTH

    const data = { id: this.id }
    // const buffer = playerIdSchema.encode(data)
    Server.sendToRoom(
        roomId,
        GameConsts.EVENT.PLAYER_RESPAWN,
        data
    )
}

function onRefreshRoom(data) {
    Server.sendToRoom(
        data.roomId,
        GameConsts.EVENT.REFRESH_ROOM,
        {
            room: rooms[data.roomId],
        }
    )
}

// function onLoadComplete(data) {
//     Server.sendToRoom(
//         data.roomId,
//         GameConsts.EVENT.UPDATE_PLAYERS,
//         {
//             room: rooms[data.roomId],
//         }
//     )
// }

function onKickPlayer(data) {
    let players = _.values(rooms[data.roomId].players)
    let player = _.find(players, { meta: { nickname: data.nickname } })
    if (! player) {
        util.error('Could not find player.')
    }

    Server.sendToRoom(
        data.roomId,
        GameConsts.EVENT.KICK_PLAYER,
        {
            id: player.id,
            roomId: data.roomId,
        }
    )
}

function onMessageSend(data) {
    const roomId = getRoomIdByPlayerId(this.id, rooms)
    const player = getPlayerById(roomId, this.id, rooms)

    const newMessage = filter.clean(data.substr(0, GameConsts.MAX_CHAT_MESSAGE_LENGTH))
    console.log('newMessage', newMessage)
    rooms[roomId].messages.push([
        player.meta.nickname,
        newMessage,
    ])
    rooms[roomId].messages = rooms[roomId].messages.slice(-5)

    // Array: [nickname, message]
    Server.sendToRoom(
        roomId,
        GameConsts.EVENT.MESSAGE_RECEIVED,
        [
            player.meta.nickname,
            newMessage,
        ]
    )
}

function onPlayerAdjustScore(data) {
    const player = getPlayerById(data.roomId, this.id, rooms)

    if (! player) {
        util.log('Player not found when adjust score', data)
        return
    }

    player.meta.score += data.amount
    player.meta.score = player.meta.score <= 0 ? 0 : player.meta.score
}

function onPlayerUpdateNickname(data) {
    let nickname = data.nickname
    var player = getPlayerById(data.roomId, this.id, rooms)

    if (! player) {
        util.log('Player not found when updating nickname: ' + this.id)
        return
    }

    if (nickname.length > 25)
        nickname = nickname.substr(0, 25)

    player.meta.nickname = nickname
}

// New player has joined
function onNewPlayer(data) {
    util.log('New player has joined: ', this.id)

    // Check for duplicate players
    var player = getPlayerById(data.roomId, this.id, rooms)
    if (player) return util.log('Player already in room: ' + this.id)

    // Create a new player
    var newPlayer = createPlayer(this.id, data.x, data.y)
    newPlayer.meta.weaponId = data.weaponId
    newPlayer.meta.nickname = data.nickname

    let roomIdPlayerWillJoin = null

    // Specified room id and room has not been created
    if (data.roomId && ! rooms[data.roomId]) {
        const newRoom = createRoom({
            id: data.roomId,
            player: newPlayer,
            map: data.map,
            gamemode: data.gamemode,
        })

        rooms[newRoom.id] = newRoom
        roomIdPlayerWillJoin = newRoom.id
        util.log('Specified room does not exist and is being created: ', newRoom.id)
    }
    // Specified room id and room has been created
    else if (
        data.roomId &&
        rooms[data.roomId] &&
        Object.keys(rooms[data.roomId].players).length < GameConsts.MAX_ROOM_SIZE
    ) {
        roomIdPlayerWillJoin = data.roomId
        util.log('Specified room does existing and has room for player: ', data.roomId)
    }
    // Either find a room to put the user in or create one
    else {
        // Find available room with space for player
        let availableRooms = Object.keys(rooms).filter(function(room) {
            if (! rooms[room].players) return true
            return Object.keys(rooms[room].players).length < GameConsts.MAX_ROOM_SIZE
        })

        // No available rooms were found so we create one.
        if (availableRooms.length <= 0) {
            const newRoom = createRoom({
                player: newPlayer,
            })

            rooms[newRoom.id] = newRoom
            roomIdPlayerWillJoin = newRoom.id
            util.log('No rooms available, creating new room to add player', newRoom.id)
        } else {
            roomIdPlayerWillJoin = availableRooms[0]
            util.log('Adding player to first available room', availableRooms[0])
        }
    }

    // Assign the new player to a team
    if (rooms[roomIdPlayerWillJoin] && rooms[roomIdPlayerWillJoin].gamemode === 'TeamDeathmatch') {
        const players = rooms[roomIdPlayerWillJoin].players
        const redTeamScore = rooms[roomIdPlayerWillJoin].redTeamScore
        const blueTeamScore = rooms[roomIdPlayerWillJoin].blueTeamScore
        newPlayer.meta.team = getTeam(players, redTeamScore, blueTeamScore)
    }

    // User to the room
    rooms[roomIdPlayerWillJoin].players[this.id] = newPlayer
    // console.log('* LOG * roomIdPlayerWillJoin', roomIdPlayerWillJoin);
    this.join(roomIdPlayerWillJoin)

    // Tell the user's client to load the game
    Server.sendToSocket(
        this.id,
        GameConsts.EVENT.LOAD_GAME,
        {
            room: rooms[roomIdPlayerWillJoin],
        }
    )

    // Tell everyone about the new player
    // Server.sendToRoom(
    //     roomIdPlayerWillJoin,
    //     GameConsts.EVENT.UPDATE_PLAYERS,
    //     {
    //         room: rooms[roomIdPlayerWillJoin],
    //     }
    // )
}

// Player has moved
function onMovePlayer(data) {
    const roomId = getRoomIdByPlayerId(this.id, rooms)

    if (! rooms[roomId]) return

    const movePlayer = rooms[roomId].players[this.id]

    if (! movePlayer || movePlayer.meta.health <= 0) return

    // const data = playerFromClientSchema.decode(buffer)

    // Update player position
    movePlayer.x = data.x
    movePlayer.y = data.y
    movePlayer.angle = data.angle
    movePlayer.flying = data.flying
    movePlayer.shooting = data.shooting
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

    var removePlayer = getPlayerById(selectedRoomId, this.id, rooms)

    // Player not found
    if (! removePlayer) {
        util.log('Player not found when disconnecting: ' + this.id)
        return
    }

    // Remove player from players array
    Object.keys(rooms).forEach((roomId) => {
        delete rooms[roomId].players[this.id]
    })

    // If the room the player left is empty close the room
    if (rooms[selectedRoomId] && Object.keys(rooms[selectedRoomId].players).length === 0) {
        util.log('Removing room: ', selectedRoomId)
        delete rooms[selectedRoomId]
    }
}

function onPlayerFullHealth(data) {
    let player = getPlayerById(data.roomId, this.id, rooms)
    player.meta.health = GameConsts.PLAYER_FULL_HEALTH

    Server.sendToSocket(
        this.id,
        GameConsts.EVENT.PLAYER_HEALTH_UPDATE,
        {
            health: player.meta.health,
        }
    )
}

function onPlayerHealing(data) {
    let player = getPlayerById(data.roomId, this.id, rooms)
    player.meta.health += 10

    if (player.meta.health > GameConsts.PLAYER_FULL_HEALTH)
        player.meta.health = GameConsts.PLAYER_FULL_HEALTH

    Server.sendToSocket(
        this.id,
        GameConsts.EVENT.PLAYER_HEALTH_UPDATE,
        {
            health: player.meta.health,
        }
    )
}

function onPlayerDamaged(data) {
    const roomId = getRoomIdByPlayerId(this.id, rooms)
    let player = getPlayerById(roomId, data.damagedPlayerId, rooms)

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

    const attackingPlayer = getPlayerById(roomId, data.attackingPlayerId, rooms)
    if (attackingPlayer) {
        attackingPlayer.meta.bulletsHit++
        if (data.wasHeadshot) attackingPlayer.meta.headshots++
    }

    // Player was killed when shot
    if (player.meta.health <= 0) {
        player.meta.health = 0
        player.meta.killingSpree = 0
        player.meta.deaths++
        player.meta.canRespawnTimestamp = moment().add(GameConsts.RESPAWN_TIME_SECONDS, 'seconds').unix()

        if (attackingPlayer) {
            attackingPlayer.meta.score += 10
            attackingPlayer.meta.kills++
            attackingPlayer.meta.killingSpree++
            attackingPlayer.meta.damageInflicted += Number(data.damage)

            if (player.meta.team === 'red') {
                rooms[roomId].blueTeamScore += 10
            }

            if (player.meta.team === 'blue') {
                rooms[roomId].redTeamScore += 10
            }

            if (attackingPlayer.meta.killingSpree > attackingPlayer.meta.bestKillingSpree) {
                attackingPlayer.meta.bestKillingSpree = attackingPlayer.meta.killingSpree
            }

            Server.sendToSocket(
                this.id,
                GameConsts.EVENT.PLAYER_KILL_CONFIRMED,
                {
                    id: attackingPlayer.id,
                    damagedPlayerId: data.damagedPlayerId,
                    killingSpree: attackingPlayer.meta.killingSpree,
                    wasHeadshot: data.wasHeadshot,
                }
            )

            Server.sendToRoom(
                roomId,
                GameConsts.EVENT.PLAYER_KILL_LOG,
                {
                    deadNickname: player.meta.nickname,
                    attackerNickname: attackingPlayer.meta.nickname,
                    weaponId: data.weaponId,
                    wasHeadshot: data.wasHeadshot,
                }
            )
        } else {
            if (player.meta.score >= 10) {
                player.meta.score -= 10
            }

            Server.sendToRoom(
                roomId,
                GameConsts.EVENT.PLAYER_KILL_LOG,
                {
                    deadNickname: player.meta.nickname,
                }
            )
        }

        const attackingDamageStats = _.get(attackingPlayer, 'meta.damageStats.attackingPlayerId') === player.id
            ? _.get(attackingPlayer, 'meta.damageStats', {})
            : {}

        Server.sendToRoom(
            roomId,
            GameConsts.EVENT.PLAYER_DAMAGED,
            {
                id: this.id,
                damagedPlayerId: data.damagedPlayerId,
                damage: data.damage,
                health: player.meta.health,
                damageStats: player.meta.damageStats,
                attackingDamageStats,
                canRespawnTimestamp: player.meta.canRespawnTimestamp,
                playerX: player.x,
                playerY: player.y,
            }
        )

        player.meta.damageStats.attackingPlayerId = null
        player.meta.damageStats.attackingDamage = 0
        player.meta.damageStats.attackingHits = 0

        if (_.get(attackingPlayer, 'meta.damageStats.attackingPlayerId') === player.id) {
            attackingPlayer.meta.damageStats.attackingPlayerId = null
            attackingPlayer.meta.damageStats.attackingDamage = 0
            attackingPlayer.meta.damageStats.attackingHits = 0
        }
        return
    }

    Server.sendToRoom(
        roomId,
        GameConsts.EVENT.PLAYER_DAMAGED,
        {
            id: this.id,
            damagedPlayerId: data.damagedPlayerId,
            damage: data.damage,
            health: player.meta.health,
            damageStats: {},
            attackingDamageStats: {},
        }
    )
}

function onBulletFired(data) {
    // const data = bulletSchema.decode(buffer)
    const roomId = getRoomIdByPlayerId(this.id, rooms)
    const player = getPlayerById(roomId, this.id, rooms)
    data.playerId = this.id

    if (! player || player.meta.health <= 0) return
    player.meta.bulletsFired++

    // Broadcast updated position to connected socket clients
    // var newBuffer/*: Uint8Array*/ = bulletSchema.encode(data)

    Server.sendToRoom(
        roomId,
        GameConsts.EVENT.BULLET_FIRED,
        data
    )
}

module.exports.init = init
module.exports.getRooms = getRooms
