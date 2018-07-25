import PlayRocketExplosion from '../PlayRocketExplosion'
import BulletRicochet from '../BulletRicochet'

export default function () {
  this.game.physics.arcade.collide(window.RS.enemyBullets, window.RS.groundPolygons, function (bullet) {
    bullet.kill()

    if (bullet.weaponId === 'RPG') {
      return PlayRocketExplosion.call(this, {
        bulletY: bullet.y,
        bulletX: bullet.x
      })
    }

    BulletRicochet.call(this, {
      bulletY: bullet.y,
      bulletX: bullet.x
    })
  }, null, this)
}
