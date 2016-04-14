// This function should return true when the player activates the "go left" control
// In this case, either holding the right arrow or tapping or clicking on the left
// side of the screen.
function leftInputIsActive() {
    return this.input.keyboard.isDown(Phaser.Keyboard.A)
}

// This function should return true when the player activates the "go right" control
// In this case, either holding the right arrow or tapping or clicking on the right
// side of the screen.
function rightInputIsActive() {
    return this.input.keyboard.isDown(Phaser.Keyboard.D)
}

// This function should return true when the player activates the "jump" control
// In this case, either holding the up arrow or tapping or clicking on the center
// part of the screen.
function upInputIsActive(duration) {
    return this.input.keyboard.downDuration(Phaser.Keyboard.W, duration)
}

// This function returns true when the player releases the "jump" control
function upInputReleased() {
    return this.input.keyboard.upDuration(Phaser.Keyboard.W)
}

export {
    leftInputIsActive,
    rightInputIsActive,
    upInputIsActive,
    upInputReleased
}
