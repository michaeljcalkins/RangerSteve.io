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
    const state = this.game.store.getState()
    const store = this.game.store
    const currentWeapon = state.player.currentWeapon

    if (store.getState().game.state !== 'active') return

    if (data.damagedPlayerId !== window.SOCKET_ID) {
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

    store.dispatch(actions.player.setPrimaryWeapon(GameConsts.WEAPONS[state.player.nextSelectedPrimaryWeaponId]))
    store.dispatch(actions.player.setSelectedPrimaryWeaponId(state.player.nextSelectedPrimaryWeaponId))
    store.dispatch(actions.player.setSecondaryWeapon(GameConsts.WEAPONS[state.player.nextSelectedSecondaryWeaponId]))
    store.dispatch(actions.player.setSelectedSecondaryWeaponId(state.player.nextSelectedSecondaryWeaponId))

    if (currentWeapon === 'primaryWeapon')
        this.rightArmSprite.animations.frame = GameConsts.WEAPONS[state.player.nextSelectedPrimaryWeaponId].frame
    else
        this.rightArmSprite.animations.frame = GameConsts.WEAPONS[state.player.nextSelectedSecondaryWeaponId].frame

    this.player.visible = true

    store.dispatch(actions.player.setPrimaryIsReloading(false))
    store.dispatch(actions.player.setPrimaryAmmoRemaining(GameConsts.WEAPONS[state.player.nextSelectedPrimaryWeaponId].ammo))

    store.dispatch(actions.player.setSecondaryIsReloading(false))
    store.dispatch(actions.player.setSecondaryAmmoRemaining(GameConsts.WEAPONS[state.player.nextSelectedSecondaryWeaponId].ammo))

    // Allow Phaser to move the player
    // so that the map doesn't
    // kill them again.
    setTimeout(() => {
        store.dispatch(actions.player.setHealth(data.health))
    }, 100)
}
