import { PropTypes } from 'react'

import Maps from '../Maps'
import PlayerById from '../PlayerById'
import actions from '../../actions'
import GameConsts from '../GameConsts.js'

const propTypes = {
    damagedPlayerId: PropTypes.string.isRequired,
    health: PropTypes.number.isRequired
}

export default function onPlayerRespawn(data) {
    check(data, propTypes)

    const state = this.game.store.getState()
    const store = this.game.store
    const currentWeapon = state.player.currentWeapon

    if (store.getState().game.state !== 'active') return

    if (data.damagedPlayerId !== ('/#' + window.socket.id)) {
        let enemyPlayer = PlayerById.call(this, data.damagedPlayerId)
        if (! enemyPlayer) return
        enemyPlayer.meta.health = 100
        return
    }

    // Create and set the new spawn point
    const spawnPoint = Maps[state.room.map].getRandomSpawnPoint()
    this.player.x = spawnPoint.x
    this.player.y = spawnPoint.y

    this.player.body.acceleration.x = 0
    this.player.body.acceleration.y = 0

    store.dispatch(actions.player.setPrimaryWeapon(GameConsts.WEAPONS[state.player.selectedPrimaryWeaponId]))
    store.dispatch(actions.player.setSecondaryWeapon(GameConsts.WEAPONS[state.player.selectedSecondaryWeaponId]))

    if (currentWeapon === 'secondaryWeapon')
        this.currentWeaponSprite.loadTexture(state.player.selectedSecondaryWeaponId)
    else
        this.currentWeaponSprite.loadTexture(state.player.selectedPrimaryWeaponId)

    store.dispatch(actions.player.setHealth(data.health))

    // Hide child groups
    this.leftArmGroup.visible = true
    this.rightArmGroup.visible = true
    this.headGroup.visible = true
    this.torsoGroup.visible = true

    store.dispatch(actions.player.setPrimaryIsReloading(false))
    store.dispatch(actions.player.setPrimaryAmmoRemaining(GameConsts.WEAPONS[state.player.selectedPrimaryWeaponId].ammo))

    store.dispatch(actions.player.setSecondaryIsReloading(false))
    store.dispatch(actions.player.setSecondaryAmmoRemaining(GameConsts.WEAPONS[state.player.selectedSecondaryWeaponId].ammo))
}
