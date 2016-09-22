import GameConsts from './GameConsts'
import { playerFaceLeft, playerFaceRight } from './PlayerFaceHandler'
import { leftInputIsActive, rightInputIsActive } from './InputHelpers'

export default function PlayerMovementHandler() {
    const state = this.game.store.getState()

    if (state.player.health <= 0) return

    if (leftInputIsActive.call(this, state.game.keyboardControls.left)) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -GameConsts.SLOPE_FEATURES.acceleration

        // Left facing head needs to be set only once
        if (this.game.input.worldX > this.player.x) {
            playerFaceRight.call(this)
        }

        if (this.game.input.worldX < this.player.x) {
            playerFaceLeft.call(this)
        }

        if (! this.game.input.activePointer.rightButton.isDown) {
            this.player.animations.play('left')
        } else {
            if (this.game.input.worldX > this.player.x) {
                this.player.frame = GameConsts.STANDING_RIGHT_FRAME
            } else {
                this.player.frame = GameConsts.STANDING_LEFT_FRAME
            }
        }
    } else if (rightInputIsActive.call(this, state.game.keyboardControls.right)) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = GameConsts.SLOPE_FEATURES.acceleration

        if (this.game.input.worldX > this.player.x) {
            playerFaceRight.call(this)
        }

        if (this.game.input.worldX < this.player.x) {
            playerFaceLeft.call(this)
        }

        if (! this.game.input.activePointer.rightButton.isDown) {
            this.player.animations.play('right')
        } else {
            if (this.game.input.worldX > this.player.x) {
                this.player.frame = GameConsts.STANDING_RIGHT_FRAME
            } else {
                this.player.frame = GameConsts.STANDING_LEFT_FRAME
            }
        }
    } else {
        // Stand still
        this.player.body.acceleration.x = 0
        this.player.animations.stop()

        if (this.game.input.worldX > this.player.x) {
            this.player.frame = GameConsts.STANDING_RIGHT_FRAME
            playerFaceRight.call(this)
        }

        if (this.game.input.worldX < this.player.x) {
            this.player.frame = GameConsts.STANDING_LEFT_FRAME
            playerFaceLeft.call(this)
        }
    }
}
