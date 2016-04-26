import CollisionHandler from '../lib/CollisionHandler'
import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'
import PlayerAngleHandler from '../lib/PlayerAngleHandler'
import emitMovePlayer from '../lib/SocketEvents/emitMovePlayer'

export default function Update() {
    CollisionHandler.call(this)
    PlayerMovementHandler.call(this)
    PlayerJumpHandler.call(this)
    PlayerAngleHandler.call(this)

    if (this.game.input.activePointer.isDown && this.player.meta.health > 0)
    {
        this.player.meta[this.currentWeapon].fire()
    }

    this.positionText.text = `${this.game.input.worldX}, ${this.game.input.worldY}`

    // Check for out of bounds kill
    if (this.player.body.onFloor() && this.player.meta.health > 0) {
        this.socket.emit('player damaged', {
            roomId: this.roomId,
            damage: 1000,
            damagedPlayerId: '/#' + this.socket.id,
            attackingPlayerId: null
        })
    }

    if (this.roomId) {
        emitMovePlayer.call(this, {
            roomId: this.roomId,
            x: this.player.x,
            y: this.player.y,
            rightArmAngle: this.rightArmGroup.angle,
            leftArmAngle: this.leftArmGroup.angle,
            facing: this.player.meta.facing
        })
    }
}
