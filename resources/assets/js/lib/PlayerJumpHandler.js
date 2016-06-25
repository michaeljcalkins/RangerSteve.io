import GameConsts from './GameConsts'

import { upInputIsActive, upInputReleased } from './InputHelpers'
import actions from '../actions'

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
        this.game.store.getState().player.jumpJetCounter > -130000
    ) {
        this.player.body.acceleration.y = GameConsts.JUMP_JET_SPEED
        store.dispatch(actions.player.incrementJumpJetCounter(GameConsts.JUMP_JET_SPEED))
    } else {
        this.player.body.acceleration.y = 0

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
