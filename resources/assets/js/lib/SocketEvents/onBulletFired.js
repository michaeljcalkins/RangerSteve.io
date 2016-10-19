import { PropTypes } from 'react'

import GameConsts from '../GameConsts'

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
    const store = this.game.store

    if (['Boot', 'Preloader'].indexOf(this.game.state.current) > -1) return

    if (data.id === window.SOCKET_ID) return

    console.log('this.game.enemyBullets', this.game.enemyBullets)

    let bullet = this.enemyBullets.getFirstDead()
    bullet.reset(data.x, data.y)
    bullet.bulletId = data.bulletId
    bullet.playerId = data.playerId
    bullet.damage = data.damage
    bullet.rotation = data.pointerAngle
    bullet.weaponId = data.weaponId
    bullet.body.gravity.y = GameConsts.BULLET_GRAVITY
    bullet.enableBody = true
    bullet.physicsBodyType = Phaser.Physics.ARCADE

    let newVelocity = this.game.physics.arcade.velocityFromRotation(data.pointerAngle, data.bulletSpeed)
    bullet.body.velocity.x += newVelocity.x
    bullet.body.velocity.y += newVelocity.y

    let distanceBetweenBulletAndPlayer = Phaser.Math.distance(this.player.x, this.player.y, data.x, data.y)
    let enemyBulletVolume = distanceBetweenBulletAndPlayer > 0 ? 1 - (distanceBetweenBulletAndPlayer / 3000) : 0

    /**
     * Sound throttle stops the four bullets
     * fired by the shotgun from being
     * played four times.
     */
    if (soundThrottle) return
    soundThrottle = true
    this.weaponSoundEffects[bullet.weaponId].volume = store.getState().game.sfxVolume * enemyBulletVolume
    this.weaponSoundEffects[bullet.weaponId].play()
    setTimeout(() => soundThrottle = false, 100)
}
