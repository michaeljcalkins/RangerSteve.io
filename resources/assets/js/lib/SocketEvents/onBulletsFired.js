import GameConsts from 'lib/GameConsts'
let soundThrottle = false

export default function onBulletsFired (data) {
  const store = this.game.store

  if (
    this.game.state.current === 'Boot' ||
    !window.RS.enemyBullets ||
    store.getState().room.state === 'ended'
  ) return
  if (data.playerId === window.SOCKET_ID) return

  const bulletSpeed = GameConsts.WEAPONS[data.weaponId].bulletSpeed
  const bulletData = {
    damage: GameConsts.WEAPONS[data.weaponId].damage,
    playerId: data.playerId
  }

  data.bullets.forEach(bulletInfo => {
    let bullet = window.RS.enemyBullets.getFirstDead()
    if (!bullet) return console.error('No bullet sprite available.')

    bullet.reset(data.x, data.y)
    bulletData.bulletId = bulletInfo.id
    bullet.data = bulletData
    bullet.alive = true
    bullet.rotation = this.game.math.wrapAngle(bulletInfo.angle) * Math.PI / 180
    bullet.weaponId = data.weaponId
    bullet.body.gravity.y = GameConsts.BULLET_GRAVITY

    let newVelocity = this.game.physics.arcade.velocityFromAngle(bulletInfo.angle, bulletSpeed)
    bullet.body.velocity.x += newVelocity.x
    bullet.body.velocity.y += newVelocity.y
  })

  let distanceBetweenBulletAndPlayer = window.Phaser.Math.distance(window.RS.player.x, window.RS.player.y, data.x, data.y)
  let enemyBulletVolume = distanceBetweenBulletAndPlayer > 0 ? 1 - (distanceBetweenBulletAndPlayer / 3000) : 0

  /**
   * Sound throttle stops the four bullets
   * fired by the shotgun from being
   * played four times.
   */
  if (soundThrottle) return
  soundThrottle = true
  window.RS.weaponSoundEffects[data.weaponId].volume = store.getState().game.sfxVolume * enemyBulletVolume
  window.RS.weaponSoundEffects[data.weaponId].play()
  setTimeout(() => { soundThrottle = false }, 100)
}
