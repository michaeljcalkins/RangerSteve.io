import emitPlayerDamaged from '../SocketEvents/emitPlayerDamaged'
import SprayBlood from '../SprayBlood'
import RocketExplosion from '../RocketExplosion'

export default function() {
    const state = this.game.store.getState()
    const currentWeapon = state.player.currentWeapon

    this.game.physics.arcade.overlap(RS.bullets, RS.enemies, function(bullet, enemy) {
        if (
            ! state.room.id ||
            state.player.health <= 0 ||
            state.room.state !== 'active' ||
            enemy.meta.health <= 0 ||
            state.room.players[enemy.id].meta.team === state.room.players[window.SOCKET_ID].meta.team
        ) return

        const yDiff = enemy.y - bullet.y
        const headshotTolerance = 20
        const wasHeadshot = yDiff > headshotTolerance

        bullet.kill()

        const bulletDamage = wasHeadshot
            ? state.player[currentWeapon].damage + 30
            : state.player[currentWeapon].damage

        SprayBlood.call(this, {
            bulletY: bullet.y,
            bulletX: bullet.x,
            playerX: enemy.x,
            bulletRotation: bullet.rotation,
        })

        if (bullet.weaponId === 'RPG') {
            RocketExplosion.call(this, {
                bulletY: bullet.y,
                bulletX: bullet.x,
            })
        }

        emitPlayerDamaged.call(this, {
            roomId: state.room.id,
            damage: bulletDamage,
            weaponId: state.player[currentWeapon].id,
            damagedPlayerId: enemy.id,
            attackingPlayerId: window.SOCKET_ID,
            wasHeadshot,
        })
    }, null, this)
}
