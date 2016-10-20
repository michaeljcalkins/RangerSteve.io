import GameConsts from './GameConsts'

import { upInputIsActive, upInputReleased } from './InputHelpers'
import actions from '../actions'

let jumpjetFxHandle = null

function isJumpInputActive() {
    const store = this.game.store
    const userSelectedJumpKey = store.getState().game.keyboardControls.up
    return upInputIsActive.call(this, 5, userSelectedJumpKey)
}

export default function PlayerJumpHandler() {
    if (this.game.state.current === 'Boot') return

    const store = this.game.store
    const onTheGround = RangerSteve.player.body.touching.down

    // Jump!
    if (isJumpInputActive.call(this) && onTheGround) {
        RangerSteve.player.body.velocity.y = -GameConsts.SLOPE_FEATURES.jump
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
            RangerSteve.jumpjetFx.volume = store.getState().game.sfxVolume
            RangerSteve.jumpjetFx.loopFull()

            RangerSteve.rightJumpjet.visible = true
            RangerSteve.leftJumpjet.visible = true
        }

        RangerSteve.player.body.acceleration.y = GameConsts.JUMP_JET_SPEED
        store.dispatch(actions.player.incrementJumpJetCounter(GameConsts.JUMP_JET_SPEED))
    } else {
        jumpjetFxHandle = false
        RangerSteve.player.body.acceleration.y = 0
        RangerSteve.jumpjetFx.stop()
        RangerSteve.rightJumpjet.visible = false
        RangerSteve.leftJumpjet.visible = false
        if (store.getState().player.jumpJetCounter < 0) {
            store.dispatch(actions.player.decrementJumpJetCounter(GameConsts.JUMP_JET_SPEED_REGENERATION))
        } else {
            store.dispatch(actions.player.setJumpJetCounter(0))
        }
    }

    // Reduce the number of available jumps if the jump input is released
    if (onTheGround && upInputReleased.call(this, store.getState().game.keyboardControls.up)) {
        RangerSteve.player.body.acceleration.x = 0
        RangerSteve.player.body.acceleration.y = 0
    }
}
