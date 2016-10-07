import emitPlayerDamaged from '../SocketEvents/emitPlayerDamaged'
import SprayBlood from '../SprayBlood'
import RocketExplosion from '../RocketExplosion'

export default function() {
    const state = this.game.store.getState()
    const currentWeapon = state.player.currentWeapon

    this.game.physics.arcade.overlap(this.bullets, this.enemies, function(bullet, enemy) {
        if (enemy.meta.health <= 0) return

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
            damage: state.player[currentWeapon].damage,
            weaponId: state.player[currentWeapon].id,
            damagedPlayerId: enemy.id,
            attackingPlayerId: window.SOCKET_ID
        })
    }, null, this)
}
