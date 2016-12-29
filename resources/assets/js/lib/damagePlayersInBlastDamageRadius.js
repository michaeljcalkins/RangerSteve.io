import emitPlayerDamaged from './SocketEvents/emitPlayerDamaged'

let lastBulletId = null
const blastRadius = 120

function getBlastDamage(distanceFromExplosion) {
    const percentFromCenter = (blastRadius - distanceFromExplosion)
    if (percentFromCenter <= 15) {
        return 19
    }
    else if (percentFromCenter <= 33) {
        return 34
    }
    else if (percentFromCenter <= 66) {
        return 67
    }
    else {
        return 100
    }
}

export default function(bullet) {
    const state = this.game.store.getState()

    // Calculate the distance between the player and the last position of the bullet
    const a = RS.player.x - bullet.x
    const b = RS.player.y - bullet.y
    const distanceFromExplosion = Math.sqrt(a * a + b * b)

    if (distanceFromExplosion <= blastRadius && lastBulletId !== bullet.bulletId) {
        // Prevents the same bullet dealing damage twice when bullets collide with two tiles
        lastBulletId = bullet.bulletId
        const blastDamage = getBlastDamage(distanceFromExplosion)

        emitPlayerDamaged.call(this, {
            damage: blastDamage,
            weaponId: bullet.weaponId,
            damagedPlayerId: window.SOCKET_ID,
        })
    }

    // Find all players in the vicinity of this explosion and deal them damage
    RS.enemies.forEach(enemy => {
        if (enemy.team === RS.player.data.team && state.room.gamemode === 'TeamDeathmatch') return

        const a = enemy.x - bullet.x
        const b = enemy.y - bullet.y
        const distanceFromExplosion = Math.sqrt(a * a + b * b)

        if (distanceFromExplosion <= blastRadius && enemy.lastBulletId !== bullet.bulletId) {
            // Prevents the same bullet dealing damage twice when bullets collide with two tiles
            enemy.lastBulletId = bullet.bulletId
            const blastDamage = getBlastDamage(distanceFromExplosion)

            emitPlayerDamaged.call(this, {
                damage: blastDamage,
                weaponId: bullet.weaponId,
                damagedPlayerId: enemy.data.id,
                attackingPlayerId: window.SOCKET_ID,
            })
        }
    })
}
