import PlayRocketExplosion from '../PlayRocketExplosion'
import BulletRicochet from '../BulletRicochet'
import damagePlayersInBlastDamageRadius from '../damagePlayersInBlastDamageRadius'

export default function () {
  this.game.physics.arcade.collide(window.RS.bullets, window.RS.groundPolygons, (bullet) => {
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
  })
}
