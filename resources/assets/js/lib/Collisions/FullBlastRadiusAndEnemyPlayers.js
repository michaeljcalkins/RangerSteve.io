import emitPlayerDamaged from '../SocketEvents/emitPlayerDamaged'

export default function() {
    if (! this.fullDamageBlastRadius) {
        return
    }

    // Did your bullets hit any enemies
    this.physics.arcade.overlap(this.enemies, this.fullDamageBlastRadius, function(enemy, bullet) {
        if (enemy.meta.health <= 0) return false

        emitPlayerDamaged.call(this, {
            roomId: state.room.id,
            damage: 100,
            weaponId: bullet.weaponId,
            damagedPlayerId: enemy.id,
            attackingPlayerId: '/#' + window.socket.id
        })
    }, null, this)
}
