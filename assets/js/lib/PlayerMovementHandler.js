import {
    playerFaceLeft,
    playerFaceRight
} from './PlayerFaceHandler'

import {
    leftInputIsActive,
    rightInputIsActive
} from './InputHandler'

export default function PlayerMovementHandler() {
    if (leftInputIsActive.call(this)) {
        // If the LEFT key is down, set the player velocity to move left
        this.player.body.acceleration.x = -this.ACCELERATION
        this.player.animations.play('left')

        // Left facing head needs to be set only once
        playerFaceLeft.call(this)
    } else if (rightInputIsActive.call(this)) {
        // If the RIGHT key is down, set the player velocity to move right
        this.player.body.acceleration.x = this.ACCELERATION
        this.player.animations.play('right')

        playerFaceRight.call(this)
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
