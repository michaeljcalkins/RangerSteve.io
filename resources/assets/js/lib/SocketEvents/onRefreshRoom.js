import includes from 'lodash/includes'
import isEqual from 'lodash/isEqual'

import actions from 'actions'
import GameConsts from 'lib/GameConsts'
import updatePlayerAngles from '../updatePlayerAngles'
import removePlayersThatLeft from '../removePlayersThatLeft'
import createNewPlayersThatDontExist from '../createNewPlayersThatDontExist'
import PlayerById from '../PlayerById'

function isNotMoving (player) {
  return player.x === player.data.lastPosition.x && player.y === player.data.lastPosition.y
}

const lastPlayerHealth = {}
const nextPlayerTween = {}

export default function onRefreshRoom (data) {
  const store = this.game.store
  const room = store.getState().room

  if (
    includes(['Boot', 'Preloader'], this.game.state.current) ||
    ! RS.enemies
  ) return

  // Players should only be allowed to move when the room state is active
  this.game.paused = data.state !== 'active'

  /**
   * 1. Check for players that do not exist anymore and destroy their sprites
   */
  removePlayersThatLeft.call(this, data)

  // Update all players that we received with new data
  Object.keys(data.players).forEach(playerId => {
    const playerData = data.players[playerId]

    // Update local player's health if there is a change
    if (playerId === window.SOCKET_ID) {
      if (lastPlayerHealth[playerId] !== data.players[playerId].health) {
        store.dispatch(actions.player.setHealth(data.players[playerId].health))
        lastPlayerHealth[playerId] = data.players[playerId].health
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
    if (! player || (store.getState().room !== null && store.getState().room.state === 'ended')) return

    /**
     * 4. Update player data
     */
    player.data.id = playerId
    player.data.health = playerData.health
    player.data.weaponId = playerData.weaponId
    player.data.team = playerData.team

    // Prevent the initial tween after respawning from visibly moving their sprite across the map.
    if (playerData.health === 100 && lastPlayerHealth[playerId] <= 0) {
      // The next time their position is tweened must be after this timestamp.
      nextPlayerTween[playerId] = Date.now() / 1000 + 0.5
    }

    if (
      (playerData.health > 0 && nextPlayerTween[playerId] < Date.now() / 1000) ||
      (playerData.health > 0 && ! nextPlayerTween[playerId])
    ) {
      // Update player position when they are alive and have not respawned recently.
      player.visible = true
      this.game.add.tween(player).to({
        x: playerData.x,
        y: playerData.y,
      }, GameConsts.TICK_RATE, Phaser.Easing.Linear.None, true)
    } else {
      // Update player position when they are dead or have just respawned back in the game.
      player.x = playerData.x
      player.y = playerData.y
    }

    // When a player's health is 100 and this var is 0 that means that they literally just respawned
    lastPlayerHealth[playerId] = playerData.health

    // If player is dead hide them from view
    if (playerData.health <= 0) {
      player.visible = false
      return
    }

    // Control jump jet visibility
    player.rightJumpjet.visible = playerData.flying
    player.leftJumpjet.visible = playerData.flying

    // Control muzzle flash visibility
    if (GameConsts.WEAPONS[playerData.weaponId]) {
      if (playerData.shooting) {
        player.rightArmSprite.animations.frame = GameConsts.WEAPONS[playerData.weaponId].shootingFrame
      } else {
        player.rightArmSprite.animations.frame = GameConsts.WEAPONS[playerData.weaponId].frame
      }
    }

    updatePlayerAngles.call(this, player, playerData.angle)

    if (
      (playerData.flying && player.facing === 'right') ||
      (isNotMoving(player) && player.facing === 'right')
    ) {
      // Standing still or flying and facing right
      player.playerSprite.animations.stop()
      player.playerSprite.frame = GameConsts.STANDING_RIGHT_FRAME
    } else if (
      (playerData.flying && player.facing === 'left') ||
      (isNotMoving(player) && player.facing === 'left')
    ) {
      // Standing still or flying and facing left
      player.playerSprite.animations.stop()
      player.playerSprite.frame = GameConsts.STANDING_LEFT_FRAME
    } else if (
      player.x > player.data.lastPosition.x &&
      player.facing === 'right' &&
      ! playerData.flying
    ) {
      player.playerSprite.animations.play('runRight-faceRight')
    } else if (
      player.x < player.data.lastPosition.x &&
      player.facing === 'left' &&
      ! playerData.flying
    ) {
      player.playerSprite.animations.play('runLeft-faceLeft')
    } else if (
        player.x < player.data.lastPosition.x &&
        player.facing === 'right' &&
        !playerData.flying
    ) {
      player.playerSprite.animations.play('runLeft-faceRight')
    } else if (
      player.x > player.data.lastPosition.x &&
      player.facing === 'left' &&
      !playerData.flying
    ) {
      player.playerSprite.animations.play('runRight-faceLeft')
    }

    player.data.lastPosition.x = player.x
    player.data.lastPosition.y = player.y
  })

  let isNewState = false

  if (! isEqual(room.state, data.state)) {
    room.state = data.state
    isNewState = true
  }

  if (! isEqual(data.players, room.players)) {
    Object.keys(data.players).forEach(playerId => {
      if (!data.players[playerId]) return

      room.players[playerId] = {
        ...room.players[playerId],
        ...data.players[playerId],
      }
    })

    isNewState = true
  }

  if (isNewState) store.dispatch(actions.room.setRoom(room))
}
