import { PropTypes } from 'react'

const propTypes = {
    bulletId: PropTypes.string.isRequired,
    playerId: PropTypes.string.isRequired,
    damage: PropTypes.number.isRequired,
    pointerAngle: PropTypes.number.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    bulletSpeed: PropTypes.number.isRequired,
    weaponId: PropTypes.string.isRequired
}

let soundThrottle = false

export default function onBulletFired(data) {
    check(data, propTypes)

    const store = this.game.store
    if (store.getState().game.state !== 'active') return
    if (data.id === ('/#' + window.socket.id)) return

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
        Skorpion: this.game.add.audio('Skorpion-sound'),
        SilverBaller: this.game.add.audio('SilverBaller-sound')
    }

    let bullet = this.enemyBullets.getFirstDead()
    bullet.reset(data.x, data.y)
    bullet.bulletId = data.bulletId
    bullet.playerId = data.playerId
    bullet.damage = data.damage
    bullet.rotation = data.pointerAngle
    bullet.weaponId = data.weaponId
    bullet.body.gravity.y = -1800
    bullet.enableBody = true
    bullet.physicsBodyType = Phaser.Physics.ARCADE

    let newVelocity = this.game.physics.arcade.velocityFromRotation(data.pointerAngle, data.bulletSpeed)
    bullet.body.velocity.x += newVelocity.x
    bullet.body.velocity.y += newVelocity.y

    if (data.weaponId === 'SilverBaller') {
        bullet.alpha = 0
    }

    let distanceBetweenBulletAndPlayer = Phaser.Math.distance(this.player.x, this.player.y, data.x, data.y)
    let enemyBulletVolume = distanceBetweenBulletAndPlayer > 0 ? 1 - (distanceBetweenBulletAndPlayer / 3000) : 0

    /**
     * Sound throttle stops the four bullets
     * fired by the shotgun from being
     * played four times.
     */
    if (soundThrottle) return
    soundThrottle = true
    soundboard[bullet.weaponId].volume = store.getState().game.sfxVolume * enemyBulletVolume
    soundboard[bullet.weaponId].play()
    setTimeout(() => soundThrottle = false, 100)
}
