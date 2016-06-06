import CollisionHandler from '../lib/CollisionHandler'
import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'
import PlayerAngleHandler from '../lib/PlayerAngleHandler'
import emitMovePlayer from '../lib/SocketEvents/emitMovePlayer'
import Maps from '../lib/Maps'

export default function Update() {
    if (this.gameState !== 'active' || ! this.room) return

    const currentWeapon = this.game.store.getState().player.currentWeapon

    CollisionHandler.call(this)
    Maps[this.room.map].update.call(this)

    if (this.player.meta.health > 0) {
        PlayerMovementHandler.call(this)
        PlayerJumpHandler.call(this)
        PlayerAngleHandler.call(this)
    }

    if (this.game.input.activePointer.isDown && this.player.meta.health > 0) {
        this.player.meta[currentWeapon].fire()
    }

    if (this.player.meta.health < 100) {
        this.hurtBorderSprite.alpha = ((100 - this.player.meta.health) / 100).toFixed(2)
    } else {
        this.hurtBorderSprite.alpha = 0
    }

    if (this.room.map) {
        Maps[this.room.map].update.call(this)
    }

    if (this.roomId && this.player.meta.health > 0 && (this.room !== null && this.room.state !== 'ended')) {
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
