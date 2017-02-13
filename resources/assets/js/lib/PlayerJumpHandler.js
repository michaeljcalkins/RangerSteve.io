import includes from 'lodash/includes'

import GameConsts from 'lib/GameConsts'

import { upInputIsActive, upInputReleased, isJumpJetInputActive } from './InputHelpers'
import actions from '../actions'

let jumpjetFxHandle = null

function isJumpInputActive () {
  const store = this.game.store
  const userSelectedJumpKey = store.getState().game.keyboardControls.up
  return upInputIsActive.call(this, 5, userSelectedJumpKey)
}

export default function PlayerJumpHandler () {
  if (includes(['Boot', 'Preloader'], this.game.state.current)) return

  const store = this.game.store
  const onTheGround = window.RS.player.body.touching.down

    // Jump!
  if (isJumpInputActive.call(this) && onTheGround) {
    window.RS.player.body.velocity.y = -GameConsts.PLAYER_PHYSICS.JUMP
    store.dispatch(actions.player.setJumping(true))
  }

    // Jump Jet!
  if (
    (
      this.game.input.activePointer.rightButton.isDown ||
      isJumpJetInputActive.call(this)
    ) &&
    store.getState().player.health > 0 &&
    this.game.store.getState().player.jumpJetCounter > GameConsts.JUMP_JET_STARTING_FUEL
  ) {
    // This deadzone stops the rapid
    // sputtering of the sound
    // and animation
    if (!jumpjetFxHandle && this.game.store.getState().player.jumpJetCounter > GameConsts.JUMP_JET_DEAD_ZONE_FUEL) {
      // Limits the sound to only be started once
      jumpjetFxHandle = true
      window.RS.jumpjetFx.volume = store.getState().game.sfxVolume
      window.RS.jumpjetFx.loopFull()

      window.RS.player.rightJumpjet.visible = true
      window.RS.player.leftJumpjet.visible = true
    }

    window.RS.player.body.acceleration.y = GameConsts.JUMP_JET_SPEED
    store.dispatch(actions.player.incrementJumpJetCounter(GameConsts.JUMP_JET_SPEED))
  } else {
    jumpjetFxHandle = false
    window.RS.player.body.acceleration.y = 0
    window.RS.jumpjetFx.stop()
    window.RS.player.rightJumpjet.visible = false
    window.RS.player.leftJumpjet.visible = false
    if (store.getState().player.jumpJetCounter < 0) {
      store.dispatch(actions.player.decrementJumpJetCounter(GameConsts.JUMP_JET_SPEED_REGENERATION))
    } else if (store.getState().player.jumpJetCounter > 0) {
      store.dispatch(actions.player.setJumpJetCounter(0))
    }
  }

    // Reduce the number of available jumps if the jump input is released
  if (onTheGround && upInputReleased.call(this, store.getState().game.keyboardControls.up)) {
    window.RS.player.body.acceleration.x = 0
    window.RS.player.body.acceleration.y = 0
  }
}
