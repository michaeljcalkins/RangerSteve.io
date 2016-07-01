import RocketExplosion from '../RocketExplosion'
import BulletRicochet from '../BulletRicochet'

export default function() {
    this.physics.arcade.overlap(this.platforms, this.bullets, function(platform, bullet) {
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

    this.physics.arcade.overlap(this.bullets, this.ground, function(bullet) {
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
