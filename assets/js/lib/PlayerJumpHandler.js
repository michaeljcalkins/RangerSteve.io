import GameConsts from './GameConsts'
import EventHandler from './EventHandler'
import {
    upInputIsActive,
    upInputReleased
} from './InputHelpers'

let jumpJetCounter = 0

export default function PlayerJumpHandler() {
    // Set a variable that is true when the player is touching the ground
    let onTheGround = this.player.body.touching.down

    // If the player is touching the ground, let him have 2 jumps
    if (onTheGround) {
        this.jumps = 2
        this.jumping = false
    }

    // Jump!
    if (this.jumps === 2 && upInputIsActive.call(this, 5) && onTheGround) {
        this.player.body.velocity.y = GameConsts.JUMP_SPEED
        this.jumping = true
    } else if (upInputIsActive.call(this, 5)) {
        this.jumps = 1
    }

    // Jump Jet!
    if (this.jumps === 1 && this.input.keyboard.isDown(Phaser.Keyboard.W) && jumpJetCounter > -130000) {
        this.player.body.acceleration.y = GameConsts.JUMP_JET_SPEED
        jumpJetCounter += GameConsts.JUMP_JET_SPEED
    } else {
        this.player.body.acceleration.y = 0

        if (jumpJetCounter < 0) {
            jumpJetCounter -= GameConsts.JUMP_JET_SPEED
        } else {
            jumpJetCounter = 0
        }
    }

    EventHandler.emit('player jump jet update', { jumpJetCounter })

    // Reduce the number of available jumps if the jump input is released
    if (this.jumping && upInputReleased.call(this)) {
        this.player.body.acceleration.x = 0
        this.player.body.acceleration.y = 0

        if (this.jumps !== 1) {
            this.jumps--
        }

        this.jumping = false
    }
}
