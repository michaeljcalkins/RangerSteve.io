import PlayRocketExplosion from '../PlayRocketExplosion'
import BulletRicochet from '../BulletRicochet'
import damagePlayersInBlastDamageRadius from '../damagePlayersInBlastDamageRadius'

export default function () {
  this.game.physics.arcade.overlap(window.RS.bullets, this.ground, function (bullet) {
    bullet.kill()

    if (bullet.weaponId === 'RPG') {
      damagePlayersInBlastDamageRadius.call(this, bullet)

      return PlayRocketExplosion.call(this, {
        bulletY: bullet.y,
        bulletX: bullet.x
      })
    }

    BulletRicochet.call(this, {
      bulletY: bullet.y,
      bulletX: bullet.x
    })
  }, function (bullet, tile) {
    return tile.collides
  }, this)
}
