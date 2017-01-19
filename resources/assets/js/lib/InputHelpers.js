// This function should return true when the player activates the "go left" control
// In this case, either holding the right arrow or tapping or clicking on the left
// side of the screen.
export function leftInputIsActive (keycode) {
  return this.game.input.keyboard.isDown(keycode)
}

// This function should return true when the player activates the "go right" control
// In this case, either holding the right arrow or tapping or clicking on the right
// side of the screen.
export function rightInputIsActive (keycode) {
  return this.game.input.keyboard.isDown(keycode)
}

// This function should return true when the player activates the "jump" control
// In this case, either holding the up arrow or tapping or clicking on the center
// part of the screen.
export function upInputIsActive (duration, keycode) {
  return this.game.input.keyboard.downDuration(keycode, duration)
}

// This function returns true when the player releases the "jump" control
export function upInputReleased (keycode) {
  return this.game.input.keyboard.upDuration(keycode)
}

export function isJumpJetInputActive () {
  const store = this.game.store
  const userSelectedJumpJetKey = store.getState().game.keyboardControls.fly
  return this.game.input.keyboard.isDown(userSelectedJumpJetKey)
}
