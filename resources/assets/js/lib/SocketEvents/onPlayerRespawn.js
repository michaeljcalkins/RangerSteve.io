import { PropTypes } from 'react'

import EventHandler from '../EventHandler'
import Weapons from '../Weapons'
import * as HighRuleJungle from '../../maps/HighRuleJungle'

const propTypes = {
    damagedPlayerId: PropTypes.string.isRequired,
    health: PropTypes.number.isRequired
}

export default function onPlayerRespawn(data) {
    check(data, propTypes)

    if (data.damagedPlayerId !== ('/#' + this.socket.id)) return

    // Set primary weapon
    this.player.meta.primaryWeapon = new Weapons[this.player.meta.selectedPrimaryWeaponId](this)
    this.player.meta.primaryWeapon.id = this.player.meta.selectedPrimaryWeaponId

    if (this.currentWeapon === 'primaryWeapon')
        this.currentWeaponSprite.loadTexture(this.player.meta.selectedPrimaryWeaponId)

    // Set secondary weapon
    this.player.meta.secondaryWeapon = new Weapons[this.player.meta.selectedSecondaryWeaponId](this)
    this.player.meta.secondaryWeapon.id = this.player.meta.selectedSecondaryWeaponId

    if (this.currentWeapon === 'secondaryWeapon')
        this.currentWeaponSprite.loadTexture(this.player.meta.selectedSecondaryWeaponId)

    this.player.meta.health = data.health
    EventHandler.emit('health update', data.health)

    // Hide child groups
    this.leftArmGroup.visible = true
    this.rightArmGroup.visible = true
    this.headGroup.visible = true
    this.torsoGroup.visible = true

    // Create and set the new spawn point
    const spawnPoint = HighRuleJungle.getRandomSpawnPoint()
    this.player.x = spawnPoint.x
    this.player.y = spawnPoint.y

    this.game.input.reset()
    this.game.input.enabled = true
}
