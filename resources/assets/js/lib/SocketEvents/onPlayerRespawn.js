import { PropTypes } from 'react'

import Maps from '../Maps'
import PlayerById from '../PlayerById'
import actions from '../../actions'
import GameConsts from '../GameConsts.js'
import CreateKeyboardBindings from '../CreateHandler/CreateKeyboardBindings'
import GetSpawnPoint from '../GetSpawnPoint'

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
        enemyPlayer.visible = true
        return
    }

    // Create and set the new spawn point
    const spawnPoints = Maps[state.room.map].getSpawnPoints()
    const spawnPoint = GetSpawnPoint(spawnPoints, this.enemies.children)

    RangerSteve.player.x = spawnPoint.x
    RangerSteve.player.y = spawnPoint.y

    RangerSteve.player.body.acceleration.x = 0
    RangerSteve.player.body.acceleration.y = 0
    RangerSteve.player.body.velocity.x = 0
    RangerSteve.player.body.velocity.y = 0

    store.dispatch(actions.player.setPrimaryWeapon(GameConsts.WEAPONS[state.player.nextSelectedPrimaryWeaponId]))
    store.dispatch(actions.player.setSelectedPrimaryWeaponId(state.player.nextSelectedPrimaryWeaponId))
    store.dispatch(actions.player.setSecondaryWeapon(GameConsts.WEAPONS[state.player.nextSelectedSecondaryWeaponId]))
    store.dispatch(actions.player.setSelectedSecondaryWeaponId(state.player.nextSelectedSecondaryWeaponId))

    if (currentWeapon === 'primaryWeapon')
        RangerSteve.rightArmSprite.animations.frame = GameConsts.WEAPONS[state.player.nextSelectedPrimaryWeaponId].frame
    else
        RangerSteve.rightArmSprite.animations.frame = GameConsts.WEAPONS[state.player.nextSelectedSecondaryWeaponId].frame

    store.dispatch(actions.player.setPrimaryIsReloading(false))
    store.dispatch(actions.player.setPrimaryAmmoRemaining(GameConsts.WEAPONS[state.player.nextSelectedPrimaryWeaponId].ammo))

    store.dispatch(actions.player.setSecondaryIsReloading(false))
    store.dispatch(actions.player.setSecondaryAmmoRemaining(GameConsts.WEAPONS[state.player.nextSelectedSecondaryWeaponId].ammo))

    RangerSteve.player.visible = true
    this.game.input.enabled = true
    this.game.input.reset()
    CreateKeyboardBindings.call(this)

    // Allow Phaser to move the player
    // so that the map doesn't
    // kill them again.
    setTimeout(() => {
        store.dispatch(actions.player.setHealth(data.health))
    }, 100)
}
