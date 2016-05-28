import emitPlayerDamaged from '../SocketEvents/emitPlayerDamaged'

export default function() {
    if (! this.partialDamageBlastRadius) {
        return
    }
    
    // Did your bullets hit any enemies
    this.physics.arcade.overlap(this.enemies, this.partialDamageBlastRadius, function(enemy, bullet) {
        if (enemy.meta.health <= 0) return false

        emitPlayerDamaged.call(this, {
            roomId: this.roomId,
            damage: 30,
            weaponId: bullet.weaponId,
            damagedPlayerId: enemy.id,
            attackingPlayerId: '/#' + this.socket.id
        })
    }, null, this)
}
