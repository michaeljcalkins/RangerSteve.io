import CollisionHandler from '../lib/CollisionHandler'
import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'
import PlayerAngleHandler from '../lib/PlayerAngleHandler'
import emitMovePlayer from '../lib/SocketEvents/emitMovePlayer'
import Maps from '../lib/Maps'

export default function Update() {
    const state = this.game.store.getState()

    if (this.gameState !== 'active' || ! state.room) return

    const currentWeapon = state.player.currentWeapon
    const isPaused = state.game.settingsModalIsOpen || state.game.chatModalIsOpen

    this.game.input.enabled = isPaused

    CollisionHandler.call(this)
    Maps[state.room.map].update.call(this)

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

    if (state.room.map) {
        Maps[state.room.map].update.call(this)
    }

    if (state.room.id && this.player.meta.health > 0 && state.room.state !== 'ended') {
        emitMovePlayer.call(this, {
            roomId: state.room.id,
            x: this.player.x,
            y: this.player.y,
            rightArmAngle: this.rightArmGroup.angle,
            leftArmAngle: this.leftArmGroup.angle,
            facing: this.player.meta.facing
        })
    }
}
