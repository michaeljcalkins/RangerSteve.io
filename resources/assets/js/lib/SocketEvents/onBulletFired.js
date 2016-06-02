import { PropTypes } from 'react'
import Weapons from '../Weapons'

const propTypes = {
    bulletId: PropTypes.string.isRequired,
    playerId: PropTypes.string.isRequired,
    damage: PropTypes.number.isRequired,
    pointerAngle: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    bulletSpeed: PropTypes.number.isRequired,
    weaponId: PropTypes.string.isRequired
}

export default function onBulletFired(data) {
    check(data, propTypes)

    if (data.id === ('/#' + this.socket.id))
        return

    /**
     * Weapon Soundboard
     */
    const soundboard = {
        AK47: this.game.add.audio('AK47-sound'),
        AUG: this.game.add.audio('AUG-sound'),
        Barrett: this.game.add.audio('Barrett-sound'),
        DesertEagle: this.game.add.audio('DesertEagle-sound'),
        G43: this.game.add.audio('G43-sound'),
        M4A1: this.game.add.audio('M4A1-sound'),
        M500: this.game.add.audio('M500-sound'),
        P90: this.game.add.audio('P90-sound'),
        RPG: this.game.add.audio('RPG-sound'),
        Skorpion: this.game.add.audio('Skorpion-sound')
    }

    let bullet = this.enemyBullets.getFirstDead()
    bullet.reset(data.x, data.y)
    bullet.bulletId = data.bulletId
    bullet.playerId = data.playerId
    bullet.damage = data.damage
    bullet.rotation = data.pointerAngle
    bullet.height = data.height
    bullet.width = data.width
    bullet.weaponId = data.weaponId
    bullet.body.gravity.y = -1800
    bullet.enableBody = true
    bullet.physicsBodyType = Phaser.Physics.ARCADE

    let newVelocity = this.game.physics.arcade.velocityFromRotation(data.pointerAngle, data.bulletSpeed)
    bullet.body.velocity.x += newVelocity.x
    bullet.body.velocity.y += newVelocity.y

    let distanceBetweenBulletAndPlayer = Phaser.Math.distance(this.player.x, this.player.y, data.x, data.y)
    let enemyBulletVolume = distanceBetweenBulletAndPlayer > 0 ? 1 - (distanceBetweenBulletAndPlayer / 3000) : 0
    soundboard[bullet.weaponId].volume = this.sfxVolume * enemyBulletVolume
    soundboard[bullet.weaponId].play()
}
