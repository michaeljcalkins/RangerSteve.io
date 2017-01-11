import includes from 'lodash/includes'
import isEqual from 'lodash/isEqual'

import actions from 'actions'
import GameConsts from 'lib/GameConsts'
import updatePlayerAngles from '../updatePlayerAngles'
import removePlayersThatLeft from '../removePlayersThatLeft'
import createNewPlayersThatDontExist from '../createNewPlayersThatDontExist'
import PlayerById from '../PlayerById'
import updatePlayerColor from '../updatePlayerColor'

function isNotMoving(player) {
  return player.x === player.data.lastPosition.x && player.y === player.data.lastPosition.y
}

const lastPlayerHealth = {}
const lastPlayerNickname = {}
const nextPlayerTween = {}

export default function onGameLoop(data) {
  const store = this.game.store
  const room = store.getState().room
  let roomData = {}
  let isNewState = false

  if (
    typeof data.state !== 'undefined' &&
    room.state !== data.state
  ) {
    room.state = data.state
    isNewState = true
  }

  if (
    includes(['Boot', 'Preloader'], this.game.state.current) ||
    ! RS.enemies
  ) return

  // Players should only be allowed to move when the room state is active
  this.game.paused = room.state !== 'active'

  /**
   * 1. Check for players that do not exist anymore and destroy their sprites
   */
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
      return
    }

    /**
     * 2. Find the player by their playerId
     */
    let player = PlayerById.call(this, playerId)

    /**
     * 3. if player is not found create them and continue
     */
    if (! player) {
      player = createNewPlayersThatDontExist.call(this, room, playerId, playerData)
    }

    // Stop updating players if the round is over
    if (! player || (store.getState().room !== null && store.getState().room.state === 'ended')) return console.error('Player not found or created.')

    /**
     * 4. Update player data
     */
    player.data.id = playerId
    GameConsts.GAME_LOOP_PLAYER_PROPERTIES.forEach(propName => {
      if (typeof playerData[propName] !== 'undefined') player.data[propName] = playerData[propName]
    })

    if (lastPlayerNickname[playerId] !== player.data.nickname) {
      player.usernameText.setText(player.data.nickname)
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

    // Prevent the initial tween after respawning from visibly moving their sprite across the map.
    if (player.data.health === 100 && lastPlayerHealth[playerId] <= 0) {
      // The next time their position is tweened must be after this timestamp.
      nextPlayerTween[playerId] = Date.now() / 1000 + 0.5
    }

    if (
      (player.data.health > 0 && nextPlayerTween[playerId] < Date.now() / 1000) ||
      (player.data.health > 0 && ! nextPlayerTween[playerId])
    ) {
      // Update player position when they are alive and have not respawned recently.
      player.visible = true
      this.game.add.tween(player).to({
        x: player.data.x,
        y: player.data.y,
      }, GameConsts.TICK_RATE, Phaser.Easing.Linear.None, true)
    } else {
      // Update player position when they are dead or have just respawned back in the game.
      player.x = player.data.x
      player.y = player.data.y
    }

    // When a player's health is 100 and this var is 0 that means that they literally just respawned
    lastPlayerHealth[playerId] = player.data.health

    // If player is dead hide them from view
    if (player.data.health <= 0) {
      player.visible = false
      return
    }

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

    if (
      (player.data.flying && player.facing === 'right') ||
      (isNotMoving(player) && player.facing === 'right')
    ) {
      // Standing still or flying and facing right
      player.playerSprite.animations.stop()
      player.playerSprite.frame = GameConsts.STANDING_RIGHT_FRAME
    } else if (
      (player.data.flying && player.facing === 'left') ||
      (isNotMoving(player) && player.facing === 'left')
    ) {
      // Standing still or flying and facing left
      player.playerSprite.animations.stop()
      player.playerSprite.frame = GameConsts.STANDING_LEFT_FRAME
    } else if (
      player.x > player.data.lastPosition.x &&
      player.facing === 'right' &&
      ! player.data.flying
    ) {
      player.playerSprite.animations.play('runRight-faceRight')
    } else if (
      player.x < player.data.lastPosition.x &&
      player.facing === 'left' &&
      ! player.data.flying
    ) {
      player.playerSprite.animations.play('runLeft-faceLeft')
    } else if (
        player.x < player.data.lastPosition.x &&
        player.facing === 'right' &&
        ! player.data.flying
    ) {
      player.playerSprite.animations.play('runLeft-faceRight')
    } else if (
      player.x > player.data.lastPosition.x &&
      player.facing === 'left' &&
      ! player.data.flying
    ) {
      player.playerSprite.animations.play('runRight-faceLeft')
    }

    player.data.lastPosition.x = player.x
    player.data.lastPosition.y = player.y

    lastPlayerNickname[playerId] = playerData.nickname
    roomData[playerId] = player.data
  })

  if (! isEqual(data.players, room.players)) {
    Object.keys(data.players).forEach(playerId => {
      room.players[playerId] = {
        ...room.players[playerId],
        ...roomData[playerId],
      }
    })

    isNewState = true
  }

  if (isNewState) store.dispatch(actions.room.setRoom(room))
}
