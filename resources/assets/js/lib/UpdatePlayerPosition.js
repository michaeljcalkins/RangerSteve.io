import _ from 'lodash'

import emitMovePlayer from '../lib/SocketEvents/emitMovePlayer'
import GameConsts from '../lib/GameConsts'

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

    let newPlayerData = {
        x: RS.player.x,
        y: RS.player.y,
        rightArmAngle: RS.rightArmGroup.angle,
        leftArmAngle: RS.leftArmGroup.angle,
        facing: state.player.facing,
        flying: RS.rightJumpjet.visible && RS.leftJumpjet.visible,
        shooting: isPlayerShooting(currentWeaponId, RS.rightArmSprite),
        weaponId: currentWeaponId,
    }

    if (_.isEqual(lastPlayerData, newPlayerData)) return

    emitMovePlayer.call(this, newPlayerData)
    lastPlayerData = newPlayerData
}