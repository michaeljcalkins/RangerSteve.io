import emitPlayerDamaged from '../SocketEvents/emitPlayerDamaged'

export default function() {
    // if (! this.fullDamageBlastRadius) {
    //     return
    // }

    this.physics.arcade.overlap(this.player, this.fullDamageBlastRadius, function(player, bullet) {
        // if (this.player.meta.health <= 0 || this.player.y < 3900) return

        emitPlayerDamaged.call(this, {
            roomId: state.room.id,
            damage: 100,
            weaponId: bullet.weaponId,
            damagedPlayerId: '/#' + window.socket.id,
            attackingPlayerId: null
        })
    }, null, this)
}
