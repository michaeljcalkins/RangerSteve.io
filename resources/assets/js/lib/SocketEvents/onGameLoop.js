import includes from 'lodash/includes'

import actions from 'actions'
import GameConsts from 'lib/GameConsts'
import updatePlayerAngles from '../updatePlayerAngles'
import removePlayersThatLeft from '../removePlayersThatLeft'
import createNewPlayersThatDontExist from '../createNewPlayersThatDontExist'
import PlayerById from '../PlayerById'
import updatePlayerColor from '../updatePlayerColor'

const lastPlayerHealth = {}
const lastPlayerNickname = {}

function updatePlayerProtection (player, isProtected) {
  player.alpha = isProtected ? 0.3 : 1
}

export default function onGameLoop (data) {
  const store = this.game.store
  const room = store.getState().room
  if (data.currentTime) {
    room.currentTime = data.currentTime
  }
  let roomData = {}

  if (
    typeof data.state !== 'undefined' &&
    room.state !== data.state
  ) {
    room.state = data.state
  }

  if (
    includes(['Boot', 'Preloader'], this.game.state.current) ||
    !window.RS.enemies
  ) return

  // Players should only be allowed to move when the room state is active
  this.game.paused = room.state !== 'active'

  // Prevents keys from being bound while trying to type in chat or other things
  if (room.state !== 'active') {
    this.game.input.enabled = false
    this.game.input.reset()
  }

  // 1. Check for players that do not exist anymore and destroy their sprites
  removePlayersThatLeft.call(this, data)

  // Update all players that we received with new data
  Object.keys(data.players).forEach(playerId => {
    const playerData = data.players[playerId]

    // Update local player's health if there is a change
    if (playerId === window.SOCKET_ID) {
      if (lastPlayerHealth[playerId] !== playerData.health && typeof playerData.health !== 'undefined') {
        store.dispatch(actions.player.setHealth(playerData.health))
        lastPlayerHealth[playerId] = playerData.health
      }

      if (lastPlayerNickname[playerId] !== playerData.nickname && typeof playerData.nickname !== 'undefined') {
        roomData[playerId] = {
          nickname: playerData.nickname
        }
      }

      if (typeof playerData.isProtected !== 'undefined') {
        window.RS.player.data.isProtected = playerData.isProtected
        updatePlayerProtection(window.RS.player, playerData.isProtected)
      }

      return
    }

    // 2. Find the player by their playerId
    let player = PlayerById.call(this, playerId)

    // 3. if player is not found create them and continue
    if (!player) {
      player = createNewPlayersThatDontExist.call(this, room, playerId, playerData)
    }

    // Stop updating players if the round is over
    if (!player) return console.error('Player not found or created.')

    // 4. Update player data
    player.data.id = playerId
    GameConsts.GAME_LOOP_PLAYER_PROPERTIES.forEach(propName => {
      if (typeof playerData[propName] !== 'undefined') player.data[propName] = playerData[propName]
    })

    if (typeof player.data.isProtected !== 'undefined') {
      updatePlayerProtection(player, player.data.isProtected)
    }

    // Prepare player data for interpolation
    player.data.targetPosition = {
      x: player.data.x,
      y: player.data.y,
      millisRemaining: GameConsts.TICK_INTERVAL_MS
    }

    // Update player's name above their player in game
    if (lastPlayerNickname[playerId] !== player.data.nickname) {
      const username = player.data.nickname || ''
      player.usernameText.setText(username)
      player.usernameText.x = (player.usernameText.width / 2) * -1
      player.usernameText.smoothed = true
    }

    // Update player's team color
    if (
      typeof player.data.team !== 'undefined' &&
      player.data.team &&
      player.data.team.length > 0
    ) {
      updatePlayerColor(player, player.data.team)
    }

    // When a player's health is 100 and this var is 0 that means that they literally just respawned
    lastPlayerHealth[playerId] = player.data.health

    // Control jump jet visibility
    player.rightJumpjet.visible = player.data.flying
    player.leftJumpjet.visible = player.data.flying

    // Control muzzle flash visibility
    if (GameConsts.WEAPONS[player.data.weaponId]) {
      player.rightArmSprite.animations.frame = player.data.shooting
        ? GameConsts.WEAPONS[player.data.weaponId].shootingFrame
        : GameConsts.WEAPONS[player.data.weaponId].frame
    }

    updatePlayerAngles.call(this, player, player.data.angle)

    // Decide what animation or frame to show
    if (isNotMovingAndFacingRight(player)) {
      // Standing still or flying and facing right
      player.playerSprite.animations.stop()
      player.playerSprite.frame = GameConsts.STANDING_RIGHT_FRAME
    } else if (isNotMovingAndFacingLeft(player)) {
      // Standing still or flying and facing left
      player.playerSprite.animations.stop()
      player.playerSprite.frame = GameConsts.STANDING_LEFT_FRAME
    } else if (isRunningRightAndFacingRight(player)) {
      player.playerSprite.animations.play('runRight-faceRight')
    } else if (isRunningLeftAndFacingLeft(player)) {
      player.playerSprite.animations.play('runLeft-faceLeft')
    } else if (isRunningLeftAndFacingRight(player)) {
      player.playerSprite.animations.play('runLeft-faceRight')
    } else if (isRunningRightAndFacingLeft(player)) {
      player.playerSprite.animations.play('runRight-faceLeft')
    }

    player.data.lastPosition.x = player.x
    player.data.lastPosition.y = player.y

    lastPlayerNickname[playerId] = playerData.nickname
    roomData[playerId] = player.data

    player.alive = player.visible = player.data.isVisibleAfterTime < room.currentTime || !player.data.isVisibleAfterTime
  })

  // Merge the differences from the server to client's room state
  Object.keys(data.players).forEach(playerId => {
    room.players[playerId] = {
      ...room.players[playerId],
      ...roomData[playerId]
    }
  })

  store.dispatch(actions.room.setRoom(room))
}

function isNotMoving (player) {
  return player.x === player.data.lastPosition.x && player.y === player.data.lastPosition.y
}

const isFlying = player => player.data.flying === true
const isNotFlying = player => player.data.flying === false
const isFacingRight = player => player.data.facing === 'right'
const isFacingLeft = player => player.data.facing === 'left'

function isNotMovingAndFacingRight (player) {
  return (isFlying(player) && isFacingRight(player)) ||
    (isNotMoving(player) && isFacingRight(player))
}

function isNotMovingAndFacingLeft (player) {
  return (isFlying(player) && isFacingLeft(player)) ||
    (isNotMoving(player) && isFacingLeft(player))
}

function isRunningRightAndFacingRight (player) {
  return player.x > player.data.lastPosition.x &&
    isFacingRight(player) &&
    isNotFlying(player)
}

function isRunningLeftAndFacingLeft (player) {
  return player.x < player.data.lastPosition.x &&
    isFacingLeft(player) &&
    isNotFlying(player)
}

function isRunningLeftAndFacingRight (player) {
  return player.x < player.data.lastPosition.x &&
    isFacingRight(player) &&
    isNotFlying(player)
}

function isRunningRightAndFacingLeft (player) {
  return player.x > player.data.lastPosition.x &&
    isFacingLeft(player) &&
    isNotFlying(player)
}
