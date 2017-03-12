'use strict'

const _ = require('lodash')
const Filter = require('bad-words')
const createGameloop = require('gameloop')

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

const NetworkStats = helpers.NetworkStats
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
  [GameConsts.EVENT.NTP_SYNC]: onNtpSync,
  [GameConsts.EVENT.PLAYER_DAMAGED]: onPlayerDamaged,
  [GameConsts.EVENT.PLAYER_FULL_HEALTH]: onPlayerFullHealth,
  [GameConsts.EVENT.PLAYER_HEALING]: onPlayerHealing,
  [GameConsts.EVENT.PLAYER_RESPAWN]: onPlayerRespawn,
  [GameConsts.EVENT.PLAYER_SCORES]: onPlayerScores,
  [GameConsts.EVENT.LOAD_COMPLETE]: onLoadComplete
}

function onData (data) {
  dataReceived += sizeOf(data)
  if (!data || data.type === undefined) return

  if (!events[data.type]) return

  events[data.type].call(this, data.payload)

  lastPlayerData[this.id] = lastPlayerData[this.id] || {}
  lastPlayerData[this.id].lastMessageTime = Date.now()
}

function init (primusInstance) {
  io = primusInstance
  Server.init(io)

  io.on('connection', onConnect)
  io.on('disconnection', onDisconnect)

  if (GameConsts.ENABLE_SERVER_NETWORK_STATS_LOG) {
    NetworkStats.loop(() => {
      const dataSent = Server.getStats().dataSent
      NetworkStats.print(dataSent, dataReceived)
    })
  }
}

function getRooms () {
  return rooms
}

const gameloop = createGameloop({
  fps: GameConsts.TICK_RATE
})

gameloop.on('update', function () {
  Object.keys(rooms).forEach((roomId) => {
    const now = Date.now()
    let roomData = {
      currentTime: now,
      players: {}
    }

    // Only send new room states
    lastRoomData[roomId] = lastRoomData[roomId] || {}
    if (lastRoomData[roomId].state !== rooms[roomId].state) {
      roomData.state = lastRoomData[roomId].state = rooms[roomId].state
    }

    Object.keys(rooms[roomId].players).forEach(function (playerId) {
      lastPlayerData[playerId] = lastPlayerData[playerId] || {}
      lastPlayerData[playerId].lastMessageTime = lastPlayerData[playerId].lastMessageTime || now

      // Find out how long it's been since this player sent us data
      const messageTimeDiff = now - lastPlayerData[playerId].lastMessageTime
      if (messageTimeDiff > (GameConsts.MAX_IDLE_TIME_IN_MS)) {
        // Disconnect this player's socket and remove references to the player in game
        // The game loop on the client's end will remove this player's sprite when they are found to be missing
        io.spark(playerId) && io.spark(playerId).end()
        return
      }

      let noDamageUntilTime = rooms[roomId].players[playerId].noDamageUntilTime

      if (noDamageUntilTime <= Date.now()) {
        rooms[roomId].players[playerId].noDamageUntilTime = 0
        rooms[roomId].players[playerId].isProtected = false
      }

      roomData.players[playerId] = {}
      GameConsts.GAME_LOOP_PLAYER_PROPERTIES.forEach(function (playerProperty) {
        if (
          typeof lastPlayerData[playerId][playerProperty] === 'undefined' || // if the value has not been sent yet
          lastPlayerData[playerId][playerProperty] !== rooms[roomId].players[playerId][playerProperty] // if the value is now different
        ) {
          roomData.players[playerId][playerProperty] = lastPlayerData[playerId][playerProperty] = rooms[roomId].players[playerId][playerProperty]
        }
      })

      roomData.players[playerId].state = rooms[roomId].players[playerId].state
    })

    Server.sendToRoom(
      roomId,
      GameConsts.EVENT.GAME_LOOP,
      roomData
    )
  })
})

gameloop.start()

const roomUpdateLoop = createGameloop({
  fps: 1
})

roomUpdateLoop.on('update', function () {
  Object.keys(rooms).forEach((roomId) => {
    // Room was likely deleted when the last player left
    if (!rooms[roomId]) return

    // Round has ended and is restarting now
    if (rooms[roomId].roundStartTime <= Date.now() && rooms[roomId].state === 'ended') {
      console.log('Restarting round for', roomId)
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

      console.log(`${rooms[roomId].map} has been selected to play ${rooms[roomId].gamemode} for room ${roomId}`)

      Object.keys(rooms[roomId].players).forEach((playerId) => {
        const player = rooms[roomId].players[playerId]
        player.health = GameConsts.PLAYER_FULL_HEALTH
        player.isProtected = false

        // Reset player scores
        player.deaths = 0
        player.kills = 0
        player.bestKillingSpree = 0
        player.killingSpree = 0
        player.bulletsFired = 0
        player.bulletsHit = 0
        player.timesHit = 0
        player.score = 0
        player.headshots = 0
        player.secondsInRound = 0

        // Reset player posisitions so we can create new respawn points
        player.x = -500
        player.y = -500
      })

      // Now that player positions are reset we can spread players throughout the map
      Object.keys(rooms[roomId].players).forEach((playerId) => {
        const spawnPoints = GameConsts.MAP_SPAWN_POINTS[rooms[roomId].map]
        const spawnPoint = getSpawnPoint(spawnPoints, rooms[roomId].players)

        // Tell each player to reload the map and give them their initial spawn locations
        Server.sendToSocket(
          playerId,
          GameConsts.EVENT.LOAD_GAME,
          {
            room: rooms[roomId],
            player: {
              x: spawnPoint.x,
              y: spawnPoint.y
            }
          }
        )
      })

      return
    }

    // Round has ended and setting the time the next round will start at
    if (rooms[roomId].roundEndTime <= Date.now() && rooms[roomId].state === 'active') {
      console.log('Round has ended for', roomId)
      rooms[roomId].state = 'ended'
      rooms[roomId].roundStartTime = Date.now() + GameConsts.END_OF_ROUND_BREAK_IN_MS
      savePlayerScoresToFirebase(rooms[roomId])
      return
    }

    Object.keys(rooms[roomId].players).forEach((playerId) => {
      rooms[roomId].players[playerId].secondsInRound++
    })
  })
})

roomUpdateLoop.start()

function onConnect (socket) {
  console.log('* LOG * onConnect, ' + socket.id)
  socket.on('data', onData)
}

// Socket client has disconnected
function onDisconnect (socket) {
  console.log('* LOG * onDisconnect', socket.id)

  const roomId = getRoomIdByPlayerId(socket.id, rooms)
  Server.sendToRoom(
    roomId,
    GameConsts.EVENT.PLAYER_LEFT,
    socket.id
  )

  removePlayer(socket.id, roomId)
}

function removePlayer (id, roomId) {
  const player = getPlayerById(rooms[roomId], id)

  // Player not found
  if (!player) {
    console.log('Player not found when disconnecting: ' + id)
    return
  }

  // Remove player's cached data
  delete lastPlayerData[id]

  // Remove player from any rooms that may have a reference
  delete rooms[roomId].players[id]

  // If this was the last player in this room delete the whole room
  if (Object.keys(rooms[roomId].players).length === 0) {
    console.log('Removing room: ', roomId)
    delete rooms[roomId]
    delete lastRoomData[roomId]
  }
}

/**
 * Player tells us when they're done loading so we can show
 * their player to everyone on the server.
 */
function onLoadComplete () {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  const player = getPlayerById(rooms[roomId], this.id)

  if (!player) {
    console.log('Player not found when they were done loading.', this.id)
    return
  }

  // Get initial spawn point
  const spawnPoints = GameConsts.MAP_SPAWN_POINTS[rooms[roomId].map]
  const spawnPoint = getSpawnPoint(spawnPoints, rooms[roomId].players)
  player.x = spawnPoint.x
  player.y = spawnPoint.y

  // Tell everyone this player has loaded the game
  player.noDamageUntilTime = Date.now() + GameConsts.NO_DAMAGE_TIME_BUFFER_IN_MS
  player.isProtected = true
}

function onPlayerScores () {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  const playerScores = {}
  Object.keys(rooms[roomId].players).forEach(function (playerId) {
    if (!_.has(rooms, '[' + roomId + '].players[' + playerId + ']')) {
      return console.error('Could not find', playerId, 'during player scores event.')
    }

    const player = rooms[roomId].players[playerId]

    playerScores[playerId] = {
      bestKillingSpree: player.bestKillingSpree || 0,
      bulletsFired: player.bulletsFired || 0,
      bulletsHit: player.bulletsHit || 0,
      deaths: player.deaths || 0,
      headshots: player.headshots || 0,
      killingSpree: player.killingSpree || 0,
      kills: player.kills || 0,
      score: player.score || 0,
      secondsInRound: player.secondsInRound || 0,
      timesHit: player.timesHit || 0
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

  const player = getPlayerById(rooms[roomId], this.id)

  if (!player) {
    console.log('Player not found when trying to respawn', this.id)
    return
  }

  player.health = GameConsts.PLAYER_FULL_HEALTH

  lastPlayerData[this.id] = {}

  const spawnPoints = GameConsts.MAP_SPAWN_POINTS[rooms[roomId].map]
  const spawnPoint = getSpawnPoint(spawnPoints, rooms[roomId].players)

  Server.sendToSocket(
    this.id,
    GameConsts.EVENT.PLAYER_RESPAWN,
    {
      x: spawnPoint.x,
      y: spawnPoint.y
    }
  )
}

function onMessageSend (data) {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  const player = getPlayerById(rooms[roomId], this.id)

  if (!player || !player.nickname) return

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

// New player has joined
function onNewPlayer (data) {
  console.log('New player has joined: ', this.id)

  // Check for duplicate players
  let player = getPlayerById(rooms[data.roomId], this.id)
  if (player) return console.log('Player already in room: ' + this.id)

  // Create a new player
  let newPlayer = createPlayer(this.id, data.x, data.y)
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
    console.log('Specified room does not exist and is being created: ', newRoom.id)
  } else if (
    data.roomId &&
    rooms[data.roomId] &&
    Object.keys(rooms[data.roomId].players).length < GameConsts.MAX_ROOM_SIZE
  ) {
    // Specified room id and room has been created
    roomIdPlayerWillJoin = data.roomId
    console.log('Specified room does existing and has room for player: ', data.roomId)
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
      console.log('No rooms available, creating new room to add player', newRoom.id)
    } else {
      roomIdPlayerWillJoin = _.sample(availableRooms)
      console.log('Adding player to first available room', roomIdPlayerWillJoin)
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

  newPlayer.noDamageUntilTime = Date.now() + GameConsts.NO_DAMAGE_TIME_BUFFER_IN_MS
  newPlayer.isProtected = true

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
      player: {
        x: newPlayer.x,
        y: newPlayer.y
      }
    }
  )

  Server.sendToRoom(
    roomIdPlayerWillJoin,
    GameConsts.EVENT.PLAYER_JOINED,
    newPlayer
  )
}

function onNtpSync (data) {
  data.ts = Date.now() / 1000
  Server.sendToSocket(this.id, GameConsts.EVENT.NTP_SYNC, data)
}

// Player has moved
function onMovePlayer (buffer) {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  const player = rooms[roomId].players[this.id]
  if (!player || player.health <= 0) return

  const data = movePlayerSchema.decode(buffer)

  // Update player position
  player.x = data.x
  player.y = data.y
  player.angle = data.angle
  player.flying = data.flying
  player.shooting = data.shooting
  player.weaponId = data.weaponId
}

function onPlayerFullHealth () {
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  let player = getPlayerById(rooms[roomId], this.id)
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

  let player = getPlayerById(rooms[roomId], this.id)
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

  let player = getPlayerById(rooms[roomId], data.damagedPlayerId)
  if (!player || player.health <= 0) return

  if (player.noDamageUntilTime > Date.now()) return

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

  const attackingPlayer = getPlayerById(rooms[roomId], data.attackingPlayerId)
  if (attackingPlayer) {
    attackingPlayer.bulletsHit++
    if (data.wasHeadshot) attackingPlayer.headshots++
  }

  // Player was killed when shot
  if (player.health <= 0) {
    player.health = 0
    player.killingSpree = 0
    player.deaths++
    player.noDamageUntilTime = Date.now() + GameConsts.RESPAWN_TIME_IN_MS + GameConsts.NO_DAMAGE_TIME_BUFFER_IN_MS
    player.isProtected = true

    // player is dead so tell everyone to hide this player in game
    player.canRespawnTime = Date.now() + GameConsts.RESPAWN_TIME_IN_MS
    player.isVisibleAfterTime = Date.now() + GameConsts.RESPAWN_TIME_IN_MS + 1000

    const spawnPoints = GameConsts.MAP_SPAWN_POINTS[rooms[roomId].map]
    const spawnPoint = getSpawnPoint(spawnPoints, rooms[roomId].players)
    player.x = spawnPoint.x
    player.y = spawnPoint.y

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
        const player = rooms[roomId].players[playerId]
        playerScores[playerId] = {
          deaths: player.deaths,
          kills: player.kills,
          bestKillingSpree: player.bestKillingSpree,
          killingSpree: player.killingSpree,
          bulletsFired: player.bulletsFired,
          bulletsHit: player.bulletsHit,
          timesHit: player.timesHit,
          score: player.score,
          headshots: player.headshots,
          secondsInRound: player.secondsInRound
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
        const player = rooms[roomId].players[playerId]
        playerScores[playerId] = {
          deaths: player.deaths,
          kills: player.kills,
          bestKillingSpree: player.bestKillingSpree,
          killingSpree: player.killingSpree,
          bulletsFired: player.bulletsFired,
          bulletsHit: player.bulletsHit,
          timesHit: player.timesHit,
          score: player.score,
          headshots: player.headshots,
          secondsInRound: player.secondsInRound
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
        canRespawnTime: player.canRespawnTime,
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
  const roomId = getRoomIdByPlayerId(this.id, rooms)
  if (!rooms[roomId]) return

  const player = getPlayerById(rooms[roomId], this.id)
  data.playerId = this.id

  if (!player || player.health <= 0) return
  player.bulletsFired++

  Server.sendToRoom(
    roomId,
    GameConsts.EVENT.BULLET_FIRED,
    data
  )
}

module.exports.init = init
module.exports.getRooms = getRooms
