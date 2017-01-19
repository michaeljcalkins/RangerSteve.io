import includes from 'lodash/includes'

import GameConsts from 'lib/GameConsts'
let soundThrottle = false

export default function onBulletFired (data) {
  const store = this.game.store

  if (
    includes(['Boot', 'Preloader'], this.game.state.current) ||
    !window.RS.enemyBullets ||
    store.getState().room.state === 'ended'
  ) return
  if (data.playerId === window.SOCKET_ID) return

  let bullet = window.RS.enemyBullets.getFirstDead()
  if (!bullet) return console.error('No bullet sprite available.')

  bullet.reset(data.x, data.y)
  bullet.data = {
    bulletId: data.bulletId,
    damage: GameConsts.WEAPONS[data.weaponId].damage,
    playerId: data.playerId
  }
  bullet.rotation = data.pointerAngle
  bullet.weaponId = data.weaponId
  bullet.body.gravity.y = GameConsts.BULLET_GRAVITY
  bullet.enableBody = true
  bullet.physicsBodyType = window.Phaser.Physics.ARCADE

  let newVelocity = this.game.physics.arcade.velocityFromRotation(data.pointerAngle, GameConsts.WEAPONS[data.weaponId].bulletSpeed)
  bullet.body.velocity.x += newVelocity.x
  bullet.body.velocity.y += newVelocity.y

  let distanceBetweenBulletAndPlayer = window.Phaser.Math.distance(window.RS.player.x, window.RS.player.y, data.x, data.y)
  let enemyBulletVolume = distanceBetweenBulletAndPlayer > 0 ? 1 - (distanceBetweenBulletAndPlayer / 3000) : 0

  /**
   * Sound throttle stops the four bullets
   * fired by the shotgun from being
   * played four times.
   */
  if (soundThrottle) return
  soundThrottle = true
  window.RS.weaponSoundEffects[bullet.weaponId].volume = store.getState().game.sfxVolume * enemyBulletVolume
  window.RS.weaponSoundEffects[bullet.weaponId].play()
  setTimeout(() => soundThrottle = false, 100)
}
