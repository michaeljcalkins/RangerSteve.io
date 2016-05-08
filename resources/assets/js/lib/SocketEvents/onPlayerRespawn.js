import { PropTypes } from 'react'
import EventHandler from '../EventHandler'
import Weapons from '../Weapons'
import PlayerById from '../PlayerById'
import * as HighRuleJungle from '../../maps/HighRuleJungle'

const propTypes = {
    damagedPlayerId: PropTypes.string.isRequired,
    health: PropTypes.number.isRequired
}

let respawnHandle = null

export default function onPlayerRespawn(data) {
    check(data, propTypes)

    if (data.damagedPlayerId !== ('/#' + this.socket.id)) {
        let selectedPlayer = PlayerById.call(this, data.damagedPlayerId)
        if (!selectedPlayer) {
            console.log('Could not find player to respawn', data.damagedPlayerId)
            return
        }

        this.player.animations.play('death')
        return
    }

    if (this.respawnInProgress) return

    this.respawnInProgress = true
    this.leftArmGroup.visible = false
    this.rightArmGroup.visible = false
    this.headGroup.visible = false
    this.torsoGroup.visible = false
    this.player.animations.play('death')

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


    clearTimeout(respawnHandle)
    respawnHandle = setTimeout(() => {
        EventHandler.emit('health update', data.health)
        this.player.visible = 0
        this.player.animations.stop()
        this.player.frame = 7
        this.leftArmGroup.visible = true
        this.rightArmGroup.visible = true
        this.headGroup.visible = true
        this.torsoGroup.visible = true
        this.player.body.acceleration.x = 0
        this.player.meta.health = data.health

        const spawnPoint = HighRuleJungle.getRandomSpawnPoint()
        this.player.x = spawnPoint.x
        this.player.y = spawnPoint.y
        this.player.visible = 1

        setTimeout(() => {
            this.respawnInProgress = false
        }, 1000)
    }, 1500)
}
