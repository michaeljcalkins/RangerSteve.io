import isEqual from 'lodash/isEqual'

import GameConsts from 'lib/GameConsts'
import Client from './Client'
import movePlayerSchema from 'lib/schemas/movePlayerSchema'

let lastPlayerData = {}

function isPlayerShooting(weaponId, rightArmSprite) {
  return GameConsts.WEAPONS[weaponId].shootingFrame === rightArmSprite.frame
}

export default function() {
  const state = this.game.store.getState()

    /**
     * Emit player's latest position on the map
     */
  if (
        ! state.room.id ||
        state.player.health <= 0 ||
        state.room.state !== 'active' ||
        state.player.facing === null
    ) return

  const currentWeaponId = state.player.currentWeapon === 'primaryWeapon'
    ? state.player.selectedPrimaryWeaponId
    : state.player.selectedSecondaryWeaponId

  const angle = (this.game.physics.arcade.angleToPointer(RS.player) * 180 / Math.PI) + 90

  let newPlayerData = {
    angle: Math.round(angle),
    flying: RS.player.rightJumpjet.visible && RS.player.leftJumpjet.visible,
    shooting: isPlayerShooting(currentWeaponId, RS.player.rightArmSprite),
    weaponId: currentWeaponId,
    x: Math.round(Math.max(0, RS.player.x)),
    y: Math.round(Math.max(0, RS.player.y)),
  }

  if (isEqual(newPlayerData, lastPlayerData)) return

  let playerDataToBeEmitted = {}
  GameConsts.MOVE_PLAYER_PROPERTIES.forEach(propName => {
    lastPlayerData[propName] = playerDataToBeEmitted[propName] = newPlayerData[propName]
  })

  const buffer = movePlayerSchema.encode(playerDataToBeEmitted)
  Client.send(GameConsts.EVENT.MOVE_PLAYER, buffer)
}
