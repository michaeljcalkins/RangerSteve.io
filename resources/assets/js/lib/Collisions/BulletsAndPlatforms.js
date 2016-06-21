import RocketExplosion from '../RocketExplosion'
import BulletRicochet from '../BulletRicochet'

export default function() {
    // Did your bullets hit any platforms
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

    this.physics.arcade.overlap(this.ground, this.bullets, function(bullet) {
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
}
