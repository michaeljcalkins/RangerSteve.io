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

        this.deathSprite.x = selectedPlayer.x - 50
        this.deathSprite.y = selectedPlayer.y - 45
        selectedPlayer.kill()
        this.deathSprite.visible = true
        this.deathSprite.animations.play('playerDeath')
        return
    }

    if (this.respawnInProgress) return

    this.respawnInProgress = true

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

    this.deathSprite.x = this.player.x - 50
    this.deathSprite.y = this.player.y - 45
    this.player.alpha = 0
    this.deathSprite.visible = true
    this.deathSprite.animations.play('playerDeath')

    clearTimeout(respawnHandle)
    respawnHandle = setTimeout(() => {
        this.player.meta.health = data.health
        EventHandler.emit('health update', this.player.meta.health)

        this.deathSprite.visible = false

        let spawnPoint = HighRuleJungle.getRandomSpawnPoint()
        this.player.x = spawnPoint.x
        this.player.y = spawnPoint.y
        this.player.alpha = 1

        setTimeout(() => {
            this.respawnInProgress = false
        }, 1000)
    }, 2500)
}
