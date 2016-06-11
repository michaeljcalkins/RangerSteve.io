import emitPlayerDamaged from '../SocketEvents/emitPlayerDamaged'
import SprayBlood from '../SprayBlood'
import RocketExplosion from '../RocketExplosion'

export default function() {
    const state = this.game.store.getState()

    // Did your bullets hit any enemies
    this.physics.arcade.overlap(this.enemies, this.bullets, function(enemy, bullet) {
        if (enemy.meta.health <= 0) return false

        bullet.kill()

        SprayBlood.call(this, {
            bulletY: bullet.y,
            bulletX: bullet.x,
            playerX: enemy.x,
            bulletRotation: bullet.rotation
        })

        if (bullet.weaponId === 'RPG') {
            RocketExplosion.call(this, {
                bulletY: bullet.y,
                bulletX: bullet.x
            })
        }

        emitPlayerDamaged.call(this, {
            roomId: state.room.id,
            damage: bullet.damage,
            weaponId: bullet.weaponId,
            damagedPlayerId: enemy.id,
            attackingPlayerId: '/#' + window.socket.id
        })
    }, null, this)
}
