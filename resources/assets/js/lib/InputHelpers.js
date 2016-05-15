// This function should return true when the player activates the "go left" control
// In this case, either holding the right arrow or tapping or clicking on the left
// side of the screen.
export function leftInputIsActive() {
    return this.game.input.keyboard.isDown(Phaser.Keyboard.A)
}

// This function should return true when the player activates the "go right" control
// In this case, either holding the right arrow or tapping or clicking on the right
// side of the screen.
export function rightInputIsActive() {
    return this.game.input.keyboard.isDown(Phaser.Keyboard.D)
}

// This function should return true when the player activates the "jump" control
// In this case, either holding the up arrow or tapping or clicking on the center
// part of the screen.
export function upInputIsActive(duration) {
    return this.game.input.keyboard.downDuration(Phaser.Keyboard.W, duration)
}

// This function returns true when the player releases the "jump" control
export function upInputReleased() {
    return this.game.input.keyboard.upDuration(Phaser.Keyboard.W)
}
