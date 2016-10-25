import SprayBlood from '../SprayBlood'
import RocketExplosion from '../RocketExplosion'

export default function() {
    const state = this.game.store.getState()

    // Did enemy bullets hit you
    this.game.physics.arcade.overlap(RangerSteve.player, RangerSteve.enemyBullets, (player, bullet) => {
        if (! bullet.weaponId || ! window.socket.id || state.player.health <= 0) return

        bullet.kill()

        SprayBlood.call(this, {
            bulletY: bullet.y,
            bulletX: bullet.x,
            playerX: player.x,
            bulletRotation: bullet.rotation
        })

        if (bullet.weaponId === 'RPG') {
            RocketExplosion.call(this, {
                bulletY: bullet.y,
                bulletX: bullet.x
            })
        }
    }, null, this)
}
