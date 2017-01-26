'use strict'

const util = require('util')
const _ = require('lodash')
const moment = require('moment')
const Filter = require('bad-words')
const gameloop = require('node-gameloop')

const Server = require('./Server')

const getSpawnPoint = require('../lib/getSpawnPoint')
const GameConsts = require('../lib/GameConsts')
const helpers = require('../lib/helpers')
const createPlayer = require('../lib/createPlayer')
const getPlayerById = require('../lib/getPlayerById')
const getTeam = require('../lib/getTeam')
const createRoom = require('../lib/createRoom')
const getRoomIdByPlayerId = require('../lib/getRoomIdByPlayerId')
const movePlayerSchema = require('../lib/schemas/movePlayerSchema')
const savePlayerScoresToFirebase = require('../lib/savePlayerScoresToFirebase')

const filter = new Filter()

// const NetworkStats = helpers.NetworkStats
const sizeOf = helpers.sizeOf

let rooms = {}
let io = null
let dataReceived = 0
let lastPlayerData = {}
let lastRoomData = {}

const events = {
  [GameConsts.EVENT.BULLET_FIRED]: onBulletFired,
  [GameConsts.EVENT.MESSAGE_SEND]: onMessageSend,
  [GameConsts.EVENT.MOVE_PLAYER]: onMovePlayer,
  [GameConsts.EVENT.NEW_PLAYER]: onNewPlayer,
  [GameConsts.EVENT.PLAYER_ADJUST_SCORE]: onPlayerAdjustScore,
  [GameConsts.EVENT.PLAYER_DAMAGED]: onPlayerDamaged,
  [GameConsts.EVENT.PLAYER_FULL_HEALTH]: onPlayerFullHealth,
  [GameConsts.EVENT.PLAYER_HEALING]: onPlayerHealing,
  [GameConsts.EVENT.PLAYER_RESPAWN]: onPlayerRespawn,
  [GameConsts.EVENT.PLAYER_SCORES]: onPlayerScores,
  [GameConsts.EVENT.REFRESH_ROOM]: onRefreshRoom
}

function onClientConnect (socket) {
  util.log('New connection: ' + socket.id + ', ' + JSON.stringify(socket.address))

  socket.on('data', onData)
}

function onData (data) {
  dataReceived += sizeOf(data)
  if (!data || data.type === undefined) return

  if (!events[data.type]) return

  events[data.type].call(this, data.payload)
}

function init (primusInstance) {
  io = primusInstance
  Server.init(io)

  io.on('connection', onClientConnect)
  io.on('disconnection', onClientDisconnect)

  // if (GameConsts.ENABLE_NETWORK_STATS) {
  //     NetworkStats.loop(() => {
  //         const dataSent = Server.getStats().dataSent
  //         NetworkStats.print(dataSent, dataReceived)
  //     })
  // }
}

function getRooms () {
  return rooms
}

gameloop.setGameLoop(function () {
  Object.keys(rooms).forEach((roomId) => {
    let roomData = {
      currentTime: Date.now(),
      players: {}
    }

    // Only send new room states
    lastRoomData[roomId] = lastRoomData[roomId] || {}
    if (lastRoomData[roomId].state !== rooms[roomId].state) {
      roomData.state = lastRoomData[roomId].state = rooms[roomId].state
    }

    Object.keys(rooms[roomId].players).forEach(function (playerId) {
      roomData.players[playerId] = {}

      GameConsts.GAME_LOOP_PLAYER_PROPERTIES.forEach(function (playerProperty) {
        lastPlayerData[playerId] = lastPlayerData[playerId] || {}
        if (
          typeof lastPlayerData[playerId][playerProperty] === 'undefined' || // if the value has not been sent yet
          lastPlayerData[playerId][playerProperty] !== rooms[roomId].players[playerId][playerProperty] // if the value is now different
        ) {
          roomData.players[playerId][playerProperty] = lastPlayerData[playerId][playerProperty] = rooms[roomId].players[playerId][playerProperty]
        }
      })
    })

    Server.sendToRoom(
      roomId,
      GameConsts.EVENT.GAME_LOOP,
      roomData
    )
  })
}, GameConsts.TICK_RATE)

setInterval(function () {
  Object.keys(rooms).forEach((roomId) => {
    // Room was likely deleted when the last player left
    if (!rooms[roomId]) return

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
        gamemode: nextGamemode
      })

      util.log(`${rooms[roomId].map} has been selected to play ${rooms[roomId].gamemode} for room ${roomId}`)

      Object.keys(rooms[roomId].players).forEach((playerId) => {
        rooms[roomId].players[playerId].health = GameConsts.PLAYER_FULL_HEALTH
        rooms[roomId].players[playerId].deaths = 0
        rooms[roomId].players[playerId].kills = 0
        rooms[roomId].players[playerId].bestKillingSpree = 0
        rooms[roomId].players[playerId].killingSpree = 0
        rooms[roomId].players[playerId].bulletsFired = 0
        rooms[roomId].players[playerId].bulletsHit = 0
        rooms[roomId].players[playerId].timesHit = 0
        rooms[roomId].players[playerId].score = 0
        rooms[roomId].players[playerId].headshots = 0
        rooms[roomId].players[playerId].secondsInRound = 0
      })

      Server.sendToRoom(
        roomId,
        GameConsts.EVENT.LOAD_GAME,
        rooms[roomId]
      )
      return
    }

    // Round has ended and setting the time the next round will start at
    if (rooms[roomId].roundEndTime <= moment().unix() && rooms[roomId].state === 'active') {
      util.log('Round has ended for', roomId)
      rooms[roomId].state = 'ended'
      rooms[roomId].roundStartTime = moment().add(GameConsts.END_OF_ROUND_BREAK_SECONDS, 'seconds').unix()
      savePlayerScoresToFirebase(rooms[roomId])
      return
    }

    Object.keys(rooms[roomId].players).forEach((playerId) => {
      rooms[roomId].players[playerId].secondsInRound++
    })
  })
}, 1000)

function onRefreshRoom () {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  let roomData = {
    state: rooms[roomId].state,
    players: {}
  }

  Object.keys(rooms[roomId].players).forEach(function (playerId) {
    if (!_.has(rooms, '[' + roomId + '].players[' + playerId + ']')) {
      return util.error('Could not find', playerId, 'during refresh room event.')
    }

    roomData.players[playerId] = {
      angle: rooms[roomId].players[playerId].angle || 0,
      flying: rooms[roomId].players[playerId].flying || false,
      health: rooms[roomId].players[playerId].health,
      nickname: rooms[roomId].players[playerId].nickname,
      shooting: rooms[roomId].players[playerId].shooting || false,
      team: rooms[roomId].players[playerId].team,
      weaponId: rooms[roomId].players[playerId].weaponId,
      x: rooms[roomId].players[playerId].x,
      y: rooms[roomId].players[playerId].y
    }
  })

  Server.sendToRoom(
    roomId,
    GameConsts.EVENT.GAME_LOOP,
    roomData
  )
}

function onPlayerScores () {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  const playerScores = {}
  Object.keys(rooms[roomId].players).forEach(function (playerId) {
    if (!_.has(rooms, '[' + roomId + '].players[' + playerId + ']')) {
      return util.error('Could not find', playerId, 'during player scores event.')
    }

    playerScores[playerId] = {
      bestKillingSpree: rooms[roomId].players[playerId].bestKillingSpree,
      bulletsFired: rooms[roomId].players[playerId].bulletsFired,
      bulletsHit: rooms[roomId].players[playerId].bulletsHit,
      deaths: rooms[roomId].players[playerId].deaths,
      headshots: rooms[roomId].players[playerId].headshots,
      killingSpree: rooms[roomId].players[playerId].killingSpree,
      kills: rooms[roomId].players[playerId].kills,
      score: rooms[roomId].players[playerId].score,
      secondsInRound: rooms[roomId].players[playerId].secondsInRound,
      timesHit: rooms[roomId].players[playerId].timesHit
    }
  })

  Server.sendToSocket(
    this.id,
    GameConsts.EVENT.PLAYER_SCORES,
    {
      blueTeamScore: rooms[roomId].blueTeamScore,
      players: playerScores,
      redTeamScore: rooms[roomId].redTeamScore,
      roundStartTime: rooms[roomId].roundStartTime
    }
  )
}

function onPlayerRespawn () {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  const player = getPlayerById(roomId, this.id, rooms)

  if (!player) {
    util.log('Player not found when trying to respawn', this.id)
    return
  }

  player.health = GameConsts.PLAYER_FULL_HEALTH

  lastPlayerData[this.id] = {}

  const spawnPoints = GameConsts.MAP_SPAWN_POINTS[rooms[roomId].map]
  const spawnPoint = getSpawnPoint(spawnPoints, rooms[roomId].players)

  const data = {
    id: this.id,
    noDamageBeforeTime: Date.now() + GameConsts.NO_DAMAGE_BEFORE_SECONDS,
    x: spawnPoint.x,
    y: spawnPoint.y
  }
  Server.sendToRoom(
    roomId,
    GameConsts.EVENT.PLAYER_RESPAWN,
    data
  )
}

function onMessageSend (data) {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  const player = getPlayerById(roomId, this.id, rooms)

  const newMessage = filter.clean(data.substr(0, GameConsts.MAX_CHAT_MESSAGE_LENGTH))
  rooms[roomId].messages.push([
    player.nickname.substr(0, GameConsts.MAX_NICKNAME_LENGTH),
    newMessage
  ])
  rooms[roomId].messages = rooms[roomId].messages.slice(-5)

  // Array: [nickname, message]
  Server.sendToRoom(
    roomId,
    GameConsts.EVENT.MESSAGE_RECEIVED,
    [
      player.nickname,
      newMessage
    ]
  )
}

function onPlayerAdjustScore (data) {
  const player = getPlayerById(data.roomId, this.id, rooms)

  if (!player) {
    util.log('Player not found when adjust score', data)
    return
  }

  player.score += data.amount
  player.score = player.score <= 0 ? 0 : player.score
}

// New player has joined
function onNewPlayer (data) {
  util.log('New player has joined: ', this.id)

  // Check for duplicate players
  var player = getPlayerById(data.roomId, this.id, rooms)
  if (player) return util.log('Player already in room: ' + this.id)

  // Create a new player
  var newPlayer = createPlayer(this.id, data.x, data.y)
  newPlayer.weaponId = data.weaponId
  newPlayer.nickname = data.nickname
  newPlayer.uid = data.uid

  let roomIdPlayerWillJoin = null

  // Specified room id and room has not been created
  if (data.roomId && !rooms[data.roomId]) {
    const newRoom = createRoom({
      id: data.roomId,
      player: newPlayer,
      map: data.map,
      gamemode: data.gamemode
    })

    rooms[newRoom.id] = newRoom
    roomIdPlayerWillJoin = newRoom.id
    util.log('Specified room does not exist and is being created: ', newRoom.id)
  } else if (
    data.roomId &&
    rooms[data.roomId] &&
    Object.keys(rooms[data.roomId].players).length < GameConsts.MAX_ROOM_SIZE
  ) {
    // Specified room id and room has been created
    roomIdPlayerWillJoin = data.roomId
    util.log('Specified room does existing and has room for player: ', data.roomId)
  } else {
    // Either find a room to put the user in or create one
    // Find available room with space for player
    let availableRooms = Object.keys(rooms).filter(function (room) {
      if (!rooms[room].players) return true
      return Object.keys(rooms[room].players).length < GameConsts.MAX_ROOM_SIZE
    })

    // No available rooms were found so we create one.
    if (availableRooms.length <= 0) {
      const newRoom = createRoom({
        gamemode: data.gamemode,
        map: data.map,
        player: newPlayer
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
    newPlayer.team = getTeam(players, redTeamScore, blueTeamScore)
  }

  // Get initial spawn point
  const spawnPoints = GameConsts.MAP_SPAWN_POINTS[rooms[roomIdPlayerWillJoin].map]
  const spawnPoint = getSpawnPoint(spawnPoints, rooms[roomIdPlayerWillJoin].players)
  newPlayer.x = spawnPoint.x
  newPlayer.y = spawnPoint.y

  // User to the room
  rooms[roomIdPlayerWillJoin].players[this.id] = newPlayer
  rooms[roomIdPlayerWillJoin].messages = _.get(rooms, '[' + roomIdPlayerWillJoin + '].messages') || []
  rooms[roomIdPlayerWillJoin].id = roomIdPlayerWillJoin
  this.join(roomIdPlayerWillJoin)

  // Tell the user's client to load the game
  Server.sendToSocket(
    this.id,
    GameConsts.EVENT.LOAD_GAME,
    {
      room: rooms[roomIdPlayerWillJoin],
      x: newPlayer.x,
      y: newPlayer.y
    }
  )
}

// Player has moved
function onMovePlayer (buffer) {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  const movePlayer = rooms[roomId].players[this.id]
  if (!movePlayer || movePlayer.health <= 0) return

  const data = movePlayerSchema.decode(buffer)

  // Update player position
  movePlayer.x = data.x
  movePlayer.y = data.y
  movePlayer.angle = data.angle
  movePlayer.flying = data.flying
  movePlayer.shooting = data.shooting
  movePlayer.weaponId = data.weaponId
}

// Socket client has disconnected
function onClientDisconnect (socket) {
  util.log('Player has disconnected: ' + socket.id)

  let selectedRoomId = null
  Object.keys(rooms).forEach((roomId) => {
    if (_.find(rooms[roomId].players, { id: socket.id })) {
      selectedRoomId = roomId
    }
  })

  var removePlayer = getPlayerById(selectedRoomId, socket.id, rooms)

  // Player not found
  if (!removePlayer) {
    util.log('Player not found when disconnecting: ' + socket.id)
    return
  }

  // Remove player from players array
  Object.keys(rooms).forEach((roomId) => {
    delete rooms[roomId].players[socket.id]
  })

  // If the room the player left is empty close the room
  if (rooms[selectedRoomId] && Object.keys(rooms[selectedRoomId].players).length === 0) {
    util.log('Removing room: ', selectedRoomId)
    delete rooms[selectedRoomId]
    delete lastRoomData[selectedRoomId]
  }
}

function onPlayerFullHealth () {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  let player = getPlayerById(roomId, this.id, rooms)
  if (!player) return
  player.health = GameConsts.PLAYER_FULL_HEALTH

  Server.sendToSocket(
    this.id,
    GameConsts.EVENT.PLAYER_HEALTH_UPDATE,
    GameConsts.PLAYER_FULL_HEALTH
  )
}

function onPlayerHealing () {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  let player = getPlayerById(roomId, this.id, rooms)
  player.health += 10

  if (player.health > GameConsts.PLAYER_FULL_HEALTH) {
    player.health = GameConsts.PLAYER_FULL_HEALTH
  }

  Server.sendToSocket(
    this.id,
    GameConsts.EVENT.PLAYER_HEALTH_UPDATE,
    player.health
  )
}

function onPlayerDamaged (data) {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  let player = getPlayerById(roomId, data.damagedPlayerId, rooms)
  if (!player || player.health <= 0) return

  player.health -= Number(data.damage)
  player.damageStats = player.damageStats || {}

  if (player.damageStats.attackingPlayerId !== data.attackingPlayerId) {
    player.damageStats.attackingPlayerId = data.attackingPlayerId
    player.damageStats.attackingDamage = 0
    player.damageStats.attackingHits = 0
  }

  player.damageStats.attackingDamage += data.damage
  player.damageStats.attackingHits++
  player.damageStats.weaponId = data.weaponId
  player.timesHit++

  const attackingPlayer = getPlayerById(roomId, data.attackingPlayerId, rooms)
  if (attackingPlayer) {
    attackingPlayer.bulletsHit++
    if (data.wasHeadshot) attackingPlayer.headshots++
  }

  // Player was killed when shot
  if (player.health <= 0) {
    player.health = 0
    player.killingSpree = 0
    player.deaths++
    player.canRespawnTimestamp = moment().add(GameConsts.RESPAWN_TIME_SECONDS, 'seconds').unix()

    if (attackingPlayer) {
      attackingPlayer.score += 10
      attackingPlayer.kills++
      attackingPlayer.killingSpree++
      attackingPlayer.damageInflicted += Number(data.damage)

      if (player.team === 'red') rooms[roomId].blueTeamScore += 10
      if (player.team === 'blue') rooms[roomId].redTeamScore += 10

      if (attackingPlayer.killingSpree > attackingPlayer.bestKillingSpree) {
        attackingPlayer.bestKillingSpree = attackingPlayer.killingSpree
      }

      const playerScores = {}
      Object.keys(rooms[roomId].players).forEach(function (playerId) {
        playerScores[playerId] = {
          deaths: rooms[roomId].players[playerId].deaths,
          kills: rooms[roomId].players[playerId].kills,
          bestKillingSpree: rooms[roomId].players[playerId].bestKillingSpree,
          killingSpree: rooms[roomId].players[playerId].killingSpree,
          bulletsFired: rooms[roomId].players[playerId].bulletsFired,
          bulletsHit: rooms[roomId].players[playerId].bulletsHit,
          timesHit: rooms[roomId].players[playerId].timesHit,
          score: rooms[roomId].players[playerId].score,
          headshots: rooms[roomId].players[playerId].headshots,
          secondsInRound: rooms[roomId].players[playerId].secondsInRound
        }
      })

      Server.sendToRoom(
        roomId,
        GameConsts.EVENT.PLAYER_KILL_LOG,
        {
          attackerNickname: attackingPlayer.nickname,
          blueTeamScore: rooms[roomId].blueTeamScore,
          damagedPlayerId: data.damagedPlayerId,
          deadNickname: player.nickname,
          id: attackingPlayer.id,
          killingSpree: attackingPlayer.killingSpree,
          players: playerScores,
          redTeamScore: rooms[roomId].redTeamScore,
          wasHeadshot: data.wasHeadshot,
          weaponId: data.weaponId
        }
      )
    } else {
      if (player.score >= 10) {
        player.score -= 10
      }

      const playerScores = {}
      Object.keys(rooms[roomId].players).forEach(function (playerId) {
        playerScores[playerId] = {
          deaths: rooms[roomId].players[playerId].deaths,
          kills: rooms[roomId].players[playerId].kills,
          bestKillingSpree: rooms[roomId].players[playerId].bestKillingSpree,
          killingSpree: rooms[roomId].players[playerId].killingSpree,
          bulletsFired: rooms[roomId].players[playerId].bulletsFired,
          bulletsHit: rooms[roomId].players[playerId].bulletsHit,
          timesHit: rooms[roomId].players[playerId].timesHit,
          score: rooms[roomId].players[playerId].score,
          headshots: rooms[roomId].players[playerId].headshots,
          secondsInRound: rooms[roomId].players[playerId].secondsInRound
        }
      })

      Server.sendToRoom(
        roomId,
        GameConsts.EVENT.PLAYER_KILL_LOG,
        {
          deadNickname: player.nickname,
          redTeamScore: rooms[roomId].redTeamScore,
          blueTeamScore: rooms[roomId].blueTeamScore,
          players: playerScores
        }
      )
    }

    const attackingDamageStats = _.get(attackingPlayer, 'damageStats.attackingPlayerId') === player.id
      ? _.get(attackingPlayer, 'damageStats', {})
      : {}

    Server.sendToRoom(
      roomId,
      GameConsts.EVENT.PLAYER_DAMAGED,
      {
        id: this.id,
        damagedPlayerId: data.damagedPlayerId,
        damage: data.damage,
        health: player.health,
        damageStats: player.damageStats,
        attackingDamageStats,
        canRespawnTimestamp: player.canRespawnTimestamp,
        playerX: player.x,
        playerY: player.y
      }
    )

    player.damageStats.attackingPlayerId = null
    player.damageStats.attackingDamage = 0
    player.damageStats.attackingHits = 0

    if (_.get(attackingPlayer, 'damageStats.attackingPlayerId') === player.id) {
      attackingPlayer.damageStats.attackingPlayerId = null
      attackingPlayer.damageStats.attackingDamage = 0
      attackingPlayer.damageStats.attackingHits = 0
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
      health: player.health,
      damageStats: {},
      attackingDamageStats: {}
    }
  )
}

function onBulletFired (data) {
  // const data = bulletSchema.decode(buffer)
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  const player = getPlayerById(roomId, this.id, rooms)
  data.playerId = this.id

  if (!player || player.health <= 0) return
  player.bulletsFired++

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
