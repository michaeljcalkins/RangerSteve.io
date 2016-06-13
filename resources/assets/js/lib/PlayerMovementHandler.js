import GameConsts from './GameConsts'
import { playerFaceLeft, playerFaceRight } from './PlayerFaceHandler'
import { leftInputIsActive, rightInputIsActive } from './InputHelpers'

export default function PlayerMovementHandler() {
    const state = this.game.store.getState()

    if (state.player.health <= 0) return

    if (leftInputIsActive.call(this, state.game.keyboardControls.left)) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -GameConsts.ACCELERATION
        this.player.animations.play('left')

        // Left facing head needs to be set only once
        if (this.game.input.worldX > this.player.x) {
            playerFaceRight.call(this)
        }

        if (this.game.input.worldX < this.player.x) {
            playerFaceLeft.call(this)
        }
    } else if (rightInputIsActive.call(this, state.game.keyboardControls.right)) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = GameConsts.ACCELERATION
        this.player.animations.play('right')

        if (this.game.input.worldX > this.player.x) {
            playerFaceRight.call(this)
        }

        if (this.game.input.worldX < this.player.x) {
            playerFaceLeft.call(this)
        }
    } else {
        // Stand still
        this.player.body.acceleration.x = 0
        this.player.animations.stop()

        if (this.game.input.worldX > this.player.x) {
            this.player.frame = 7
            playerFaceRight.call(this)
        }

        if (this.game.input.worldX < this.player.x) {
            this.player.frame = 6
            playerFaceLeft.call(this)
        }
    }
}
