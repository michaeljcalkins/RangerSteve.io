import emitPlayerDamaged from '../SocketEvents/emitPlayerDamaged'
import PlayBloodSpray from '../PlayBloodSpray'
import PlayRocketExplosion from '../PlayRocketExplosion'
import damagePlayersInBlastDamageRadius from '../damagePlayersInBlastDamageRadius'

export default function() {
    const state = this.game.store.getState()
    const currentWeapon = state.player.currentWeapon

    this.game.physics.arcade.overlap(RS.bullets, RS.enemies, function(bullet, enemy) {
        if (
            ! state.room.id ||
            state.player.health <= 0 ||
            state.room.state !== 'active' ||
            enemy.data.health <= 0 ||
            enemy.data.team === RS.player.data.team
        ) return

        const yDiff = enemy.y - bullet.y
        const headshotTolerance = 20
        const wasHeadshot = yDiff > headshotTolerance

        bullet.kill()

        const bulletDamage = wasHeadshot
            ? state.player[currentWeapon].damage + 30
            : state.player[currentWeapon].damage

        PlayBloodSpray.call(this, {
            bulletRotation: bullet.rotation,
            bulletX: bullet.x,
            bulletY: bullet.y,
            playerX: enemy.x,
        })

        if (bullet.weaponId === 'RPG') {
            damagePlayersInBlastDamageRadius.call(this, bullet)

            PlayRocketExplosion.call(this, {
                bulletX: bullet.x,
                bulletY: bullet.y,
            })
        }

        emitPlayerDamaged.call(this, {
            damage: bulletDamage,
            weaponId: state.player[currentWeapon].id,
            damagedPlayerId: enemy.data.id,
            attackingPlayerId: window.SOCKET_ID,
            wasHeadshot,
        })
    }, null, this)
}
