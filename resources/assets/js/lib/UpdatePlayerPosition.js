import _ from 'lodash'

import emitMovePlayer from '../lib/SocketEvents/emitMovePlayer'

let lastPlayerData = {}

export default function() {
    const state = this.game.store.getState()

    /**
     * Emit player's latest position on the map
     */
    if (state.room.id && state.player.health > 0 && state.room.state !== 'ended' && state.player.facing !== null) {
        let newPlayerData = {
            id: ('/#' + window.socket.id),
            roomId: state.room.id,
            x: this.player.x,
            y: this.player.y,
            rightArmAngle: this.rightArmGroup.angle,
            leftArmAngle: this.leftArmGroup.angle,
            facing: state.player.facing,
            flying: this.rightJumpjet.visible && this.leftJumpjet.visible,
            shooting: this.muzzleFlash.visible,
            weaponId: state.player.currentWeapon === 'primaryWeapon' ? state.player.selectedPrimaryWeaponId : state.player.selectedSecondaryWeaponId
        }

        if (_.isEqual(lastPlayerData, newPlayerData)) return

        emitMovePlayer.call(this, newPlayerData)
        lastPlayerData = newPlayerData
    }
}