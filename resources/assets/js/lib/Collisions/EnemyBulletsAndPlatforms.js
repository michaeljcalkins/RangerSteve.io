import RocketExplosion from '../RocketExplosion'
import BulletRicochet from '../BulletRicochet'

export default function() {
    // Did enemy bullets hit any platforms
    this.physics.arcade.overlap(this.enemyBullets, this.platforms, function(bullet) {
        bullet.kill()

        if (bullet.weaponId === 'RPG') {
            RocketExplosion.call(this, {
                bulletY: bullet.y,
                bulletX: bullet.x
            })
        }

        BulletRicochet.call(this, {
            bulletY: bullet.y,
            bulletX: bullet.x
        })
    }, null, this)

    this.physics.arcade.overlap(this.enemyBullets, this.ground, function(bullet) {
        bullet.kill()

        if (bullet.weaponId === 'RPG') {
            RocketExplosion.call(this, {
                bulletY: bullet.y,
                bulletX: bullet.x
            })
        }

        BulletRicochet.call(this, {
            bulletY: bullet.y,
            bulletX: bullet.x
        })
    }, function(bullet, tile) {
        return tile.collides
    }, this)
}
