import emitPlayerDamaged from '../SocketEvents/emitPlayerDamaged'

export default function() {
    this.physics.arcade.collide(this.player, this.groundSprite, () => {
        if (this.player.meta.health <= 0 || this.player.y < 3900) return

        this.game.input.enabled = false
        this.player.body.acceleration.x = 0
        this.player.body.acceleration.y = 0
        this.player.meta.health = 0
        this.leftArmGroup.visible = false
        this.rightArmGroup.visible = false
        this.headGroup.visible = false
        this.torsoGroup.visible = false

        emitPlayerDamaged.call(this, {
            roomId: this.roomId,
            damage: 1000,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: null
        })

        this.player.animations.play('death')
    })
}
