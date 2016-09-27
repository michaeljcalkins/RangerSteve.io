import GameConsts from './GameConsts'
import { playerFaceLeft, playerFaceRight } from './PlayerFaceHandler'

function isRunningLeftAndFacingLeft(isMovingLeft, isMovingRight, mouseX, playerX) {
    return isMovingLeft && ! isMovingRight && mouseX < playerX
}

function isRunningLeftAndFacingRight(isMovingLeft, isMovingRight, mouseX, playerX) {
    return isMovingLeft && ! isMovingRight && mouseX > playerX
}

function isRunningRightAndFacingLeft(isMovingLeft, isMovingRight, mouseX, playerX) {
    return ! isMovingLeft && isMovingRight && mouseX < playerX
}

function isRunningRightAndFacingRight(isMovingLeft, isMovingRight, mouseX, playerX) {
    return ! isMovingLeft && isMovingRight && mouseX > playerX
}

function isNotMoving(isMovingLeft, isMovingRight) {
    return ! isMovingLeft && ! isMovingRight
}

export default function PlayerMovementHandler() {
    const state = this.game.store.getState()
    const isMovingLeft = this.game.input.keyboard.isDown(state.game.keyboardControls.left)
    const isMovingRight = this.game.input.keyboard.isDown(state.game.keyboardControls.right)

    if (state.player.health <= 0) return

    // Left facing head needs to be set only once
    if (this.game.input.worldX > this.player.x) {
        playerFaceRight.call(this)
    }
    else if (this.game.input.worldX < this.player.x) {
        playerFaceLeft.call(this)
    }

    if (isRunningLeftAndFacingLeft(isMovingLeft, isMovingRight, this.game.input.worldX, this.player.x)) {
        this.player.animations.play('runLeft-faceLeft')
    }
    else if (isRunningLeftAndFacingRight(isMovingLeft, isMovingRight, this.game.input.worldX, this.player.x)) {
        this.player.animations.play('runLeft-faceRight')
    }
    else if (isRunningRightAndFacingLeft(isMovingLeft, isMovingRight, this.game.input.worldX, this.player.x)) {
        this.player.animations.play('runRight-faceLeft')
    }
    else if (isRunningRightAndFacingRight(isMovingLeft, isMovingRight, this.game.input.worldX, this.player.x)) {
        this.player.animations.play('runRight-faceRight')
    }

    // Standing still and facing right
    if (
        (isNotMoving(isMovingLeft, isMovingRight) || this.game.input.activePointer.rightButton.isDown) &&
        this.game.input.worldX < this.player.x
    ) {
        this.player.frame = GameConsts.STANDING_RIGHT_FRAME
    }

    // Standing still and facing left
    if (
        (isNotMoving(isMovingLeft, isMovingRight) || this.game.input.activePointer.rightButton.isDown) &&
        this.game.input.worldX > this.player.x
    ) {
        this.player.frame = GameConsts.STANDING_LEFT_FRAME
    }

    // If the LEFT key is down, set the player velocity to move left
    if (isMovingLeft) {
        this.player.body.acceleration.x = -GameConsts.SLOPE_FEATURES.acceleration
    }

    // If the RIGHT key is down, set the player velocity to move right
    if (isMovingRight) {
        this.player.body.acceleration.x = GameConsts.SLOPE_FEATURES.acceleration
    }

    // Stand still
    if (isNotMoving(isMovingLeft, isMovingRight)) {
        this.player.body.acceleration.x = 0
        this.player.animations.stop()
    }
}
