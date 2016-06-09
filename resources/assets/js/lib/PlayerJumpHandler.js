import GameConsts from './GameConsts'

import { upInputIsActive, upInputReleased } from './InputHelpers'
import actions from '../actions'

let jumpJetCounter = 0

export default function PlayerJumpHandler() {
    // Set a variable that is true when the player is touching the ground
    const onTheGround = this.player.body.touching.down

    // If the player is touching the ground, let him have 2 jumps
    if (onTheGround) {
        this.game.store.dispatch(actions.player.setJumps(2))
        this.game.store.dispatch(actions.player.setJumping(false))
    }

    // Jump!
    if (this.game.store.getState().player.jumps === 2 && upInputIsActive.call(this, 5) && onTheGround) {
        this.player.body.velocity.y = GameConsts.JUMP_SPEED
        this.game.store.dispatch(actions.player.setJumping(true))
    } else if (upInputIsActive.call(this, 5)) {
        this.game.store.dispatch(actions.player.setJumps(1))
    }

    // Jump Jet!
    if (this.game.store.getState().player.jumps === 1 && this.input.keyboard.isDown(Phaser.Keyboard.W) && this.game.store.getState().player.jumpJetCounter > -130000) {
        this.player.body.acceleration.y = GameConsts.JUMP_JET_SPEED
        this.game.store.dispatch(actions.player.incrementJumpJetCounter(GameConsts.JUMP_JET_SPEED))
    } else {
        this.player.body.acceleration.y = 0

        if (this.game.store.getState().player.jumpJetCounter < 0) {
            this.game.store.dispatch(actions.player.decrementJumpJetCounter(GameConsts.JUMP_JET_SPEED_REGENERATION))
        } else {
            this.game.store.dispatch(actions.player.setJumpJetCounter(0))
        }
    }

    this.game.store.dispatch(actions.player.setJumpJetCounter(jumpJetCounter))

    // Reduce the number of available jumps if the jump input is released
    if (this.game.store.getState().player.jumping && upInputReleased.call(this)) {
        this.player.body.acceleration.x = 0
        this.player.body.acceleration.y = 0

        if (this.game.store.getState().player.jumps !== 1) {
            this.game.store.dispatch(actions.player.decrementJumps())
        }

        this.game.store.dispatch(actions.player.setJumping(false))
    }
}
