// @flow
import includes from 'lodash/includes'

import GameConsts from 'lib/GameConsts'
let soundThrottle = false

export default function onBulletFired(data) {
    const store = this.game.store

    if (includes(['Boot', 'Preloader'], this.game.state.current)) return
    if (data.playerId === window.SOCKET_ID) return

    let bullet = RS.enemyBullets.getFirstDead()
    bullet.reset(data.x, data.y)
    bullet.data = {
        bulletId: data.bulletId,
        damage: GameConsts.WEAPONS[data.weaponId].damage,
        playerId: data.playerId,
    }
    bullet.rotation = data.pointerAngle
    bullet.weaponId = data.weaponId
    bullet.body.gravity.y = GameConsts.BULLET_GRAVITY
    bullet.enableBody = true
    bullet.physicsBodyType = Phaser.Physics.ARCADE

    let newVelocity = this.game.physics.arcade.velocityFromRotation(data.pointerAngle, GameConsts.WEAPONS[data.weaponId].bulletSpeed)
    bullet.body.velocity.x += newVelocity.x
    bullet.body.velocity.y += newVelocity.y

    let distanceBetweenBulletAndPlayer = Phaser.Math.distance(RS.player.x, RS.player.y, data.x, data.y)
    let enemyBulletVolume = distanceBetweenBulletAndPlayer > 0 ? 1 - (distanceBetweenBulletAndPlayer / 3000) : 0

    /**
     * Sound throttle stops the four bullets
     * fired by the shotgun from being
     * played four times.
     */
    if (soundThrottle) return
    soundThrottle = true
    RS.weaponSoundEffects[bullet.weaponId].volume = store.getState().game.sfxVolume * enemyBulletVolume
    RS.weaponSoundEffects[bullet.weaponId].play()
    setTimeout(() => soundThrottle = false, 100)
}
