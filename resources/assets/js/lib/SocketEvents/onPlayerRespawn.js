import { PropTypes } from 'react'

import Weapons from '../Weapons'
import Maps from '../Maps'
import emitPlayerUpdateWeapon from './emitPlayerUpdateWeapon'
import PlayerById from '../PlayerById'
import actions from '../../actions'

const propTypes = {
    damagedPlayerId: PropTypes.string.isRequired,
    health: PropTypes.number.isRequired
}

export default function onPlayerRespawn(data) {
    check(data, propTypes)

    const state = this.game.store.getState()
    const store = this.game.store
    const currentWeapon = state.player.currentWeapon

    if (data.damagedPlayerId !== ('/#' + this.socket.id)) {
        let enemyPlayer = PlayerById.call(this, data.damagedPlayerId)
        if (! enemyPlayer) return
        enemyPlayer.meta.health = 100
        return
    }

    this.player.body.acceleration.x = 0
    this.player.body.acceleration.y = 0

    store.dispatch(actions.player.setPrimaryWeapon(new Weapons[state.player.selectedPrimaryWeaponId](this)))
    store.dispatch(actions.player.setSecondaryWeapon(new Weapons[state.player.selectedSecondaryWeaponId](this)))

    if (currentWeapon === 'secondaryWeapon')
        this.currentWeaponSprite.loadTexture(state.player.selectedSecondaryWeaponId)
    else
        this.currentWeaponSprite.loadTexture(state.player.selectedPrimaryWeaponId)

    store.dispatch(actions.player.setHealth(data.health))

    const currentWeaponMeta = this.currentWeapon === 'primary'
        ? state.player.primaryWeapon.meta
        : state.player.secondaryWeapon.meta

    emitPlayerUpdateWeapon.call(this, {
        id: '/#' + this.socket.id,
        roomId: this.roomId,
        currentWeaponMeta
    })

    // Hide child groups
    this.leftArmGroup.visible = true
    this.rightArmGroup.visible = true
    this.headGroup.visible = true
    this.torsoGroup.visible = true

    // Create and set the new spawn point
    const spawnPoint = Maps[state.room.map].getRandomSpawnPoint()
    this.player.x = spawnPoint.x
    this.player.y = spawnPoint.y

    // this.game.input.reset()
    // this.game.input.enabled = true
}
