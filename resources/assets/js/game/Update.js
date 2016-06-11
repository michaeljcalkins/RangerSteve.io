import CollisionHandler from '../lib/CollisionHandler'
import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'
import PlayerAngleHandler from '../lib/PlayerAngleHandler'
import emitMovePlayer from '../lib/SocketEvents/emitMovePlayer'
import Maps from '../lib/Maps'

export default function Update() {
    const state = this.game.store.getState()

    this.audioPlayer.volume = state.game.musicVolume

    if (state.game.state !== 'active' || ! state.room) return

    const currentWeapon = state.player.currentWeapon
    const isPaused = state.game.settingsModalIsOpen || state.game.chatModalIsOpen
    this.game.input.enabled = !isPaused

    CollisionHandler.call(this)
    Maps[state.room.map].update.call(this)

    if (state.player.health > 0) {
        PlayerMovementHandler.call(this)
        PlayerJumpHandler.call(this)
        PlayerAngleHandler.call(this)
    }

    if (this.game.input.activePointer.isDown && state.player.health > 0) {

        state.player[currentWeapon].fire()
    }

    if (state.player.health < 100) {
        this.hurtBorderSprite.alpha = ((100 - state.player.health) / 100).toFixed(2)
    } else {
        this.hurtBorderSprite.alpha = 0
    }

    if (state.room.map) {
        Maps[state.room.map].update.call(this)
    }

    if (state.room.id && state.player.health > 0 && state.room.state !== 'ended' && state.player.facing !== null) {
        emitMovePlayer.call(this, {
            roomId: state.room.id,
            x: this.player.x,
            y: this.player.y,
            rightArmAngle: this.rightArmGroup.angle,
            leftArmAngle: this.leftArmGroup.angle,
            facing: state.player.facing
        })
    }
}
