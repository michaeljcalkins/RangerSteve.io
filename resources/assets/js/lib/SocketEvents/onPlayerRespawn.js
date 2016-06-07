import { PropTypes } from 'react'

import EventHandler from '../EventHandler'
import Weapons from '../Weapons'
import Maps from '../Maps'
import emitPlayerUpdateWeapon from './emitPlayerUpdateWeapon'
import PlayerById from '../PlayerById'

const propTypes = {
    damagedPlayerId: PropTypes.string.isRequired,
    health: PropTypes.number.isRequired
}

export default function onPlayerRespawn(data) {
    check(data, propTypes)

    if (data.damagedPlayerId !== ('/#' + this.socket.id)) {
        let enemyPlayer = PlayerById.call(this, data.damagedPlayerId)
        if (! enemyPlayer) return
        enemyPlayer.meta.health = 100
        return
    }

    this.player.body.acceleration.x = 0
    this.player.body.acceleration.y = 0

    // Set primary weapon
    this.player.meta.primaryWeapon = new Weapons[this.player.meta.selectedPrimaryWeaponId](this)

    const currentWeapon = this.game.store.getState().player.currentWeapon

    if (currentWeapon === 'primaryWeapon')
        this.currentWeaponSprite.loadTexture(this.player.meta.selectedPrimaryWeaponId)

    // Set secondary weapon
    this.player.meta.secondaryWeapon = new Weapons[this.player.meta.selectedSecondaryWeaponId](this)

    if (currentWeapon === 'secondaryWeapon')
        this.currentWeaponSprite.loadTexture(this.player.meta.selectedSecondaryWeaponId)

    this.player.meta.health = data.health
    EventHandler.emit('health update', data.health)

    const currentWeaponMeta = this.currentWeapon === 'primary'
        ? this.player.meta.primaryWeapon.meta
        : this.player.meta.secondaryWeapon.meta

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

    this.game.input.reset()
    this.game.input.enabled = true
}
