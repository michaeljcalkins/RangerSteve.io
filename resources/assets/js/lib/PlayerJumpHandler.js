import GameConsts from './GameConsts'

import { upInputIsActive, upInputReleased } from './InputHelpers'
import actions from '../actions'

let jumpjetFxHandle = null

export default function PlayerJumpHandler() {
    const store = this.game.store
    const onTheGround = this.player.body.touching.down

    // Jump!
    if (upInputIsActive.call(this, 5, store.getState().game.keyboardControls.up) && onTheGround) {
        this.player.body.velocity.y = GameConsts.JUMP_SPEED
        store.dispatch(actions.player.setJumping(true))
    }

    // Jump Jet!
    if (
        this.game.input.activePointer.rightButton.isDown &&
        store.getState().player.health > 0 &&
        this.game.store.getState().player.jumpJetCounter > GameConsts.JUMP_JET_STARTING_FUEL
    ) {
        // This deadzone stops the rapid
        // sputtering of the sound
        // and animation
        if (! jumpjetFxHandle && this.game.store.getState().player.jumpJetCounter > GameConsts.JUMP_JET_DEAD_ZONE_FUEL) {
            // Limits the sound to only be started once
            jumpjetFxHandle = true
            this.jumpjetFx.volume = store.getState().game.sfxVolume
            this.jumpjetFx.loopFull()

            this.rightJumpjet.visible = true
            this.leftJumpjet.visible = true
        }

        this.player.body.acceleration.y = GameConsts.JUMP_JET_SPEED
        store.dispatch(actions.player.incrementJumpJetCounter(GameConsts.JUMP_JET_SPEED))
    } else {
        jumpjetFxHandle = false
        this.player.body.acceleration.y = 0
        this.jumpjetFx.stop()
        this.rightJumpjet.visible = false
        this.leftJumpjet.visible = false
        if (store.getState().player.jumpJetCounter < 0) {
            store.dispatch(actions.player.decrementJumpJetCounter(GameConsts.JUMP_JET_SPEED_REGENERATION))
        } else {
            store.dispatch(actions.player.setJumpJetCounter(0))
        }
    }

    // Reduce the number of available jumps if the jump input is released
    if (onTheGround && upInputReleased.call(this, store.getState().game.keyboardControls.up)) {
        this.player.body.acceleration.x = 0
        this.player.body.acceleration.y = 0
    }
}
