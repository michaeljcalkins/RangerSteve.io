import actions from 'actions'
import GameConsts from 'lib/GameConsts'
import KillCurrentPlayer from '../KillCurrentPlayer'
import ReloadGunWhenEmpty from '../ReloadGunWhenEmpty'

let lastSwitchWeaponKey = null
let reloadHandle = null

export default function () {
  const store = this.game.store

  /**
   * Open settings modal
   */
  this.input.keyboard.addKey(window.Phaser.Keyboard.TAB).onDown.add(() => {
    store.dispatch(actions.game.openLeaderboardModal())
  })

  this.input.keyboard.addKey(window.Phaser.Keyboard.TAB).onUp.add(() => {
    store.dispatch(actions.game.closeLeaderboardModal())
  })

  /**
   * Reload current gun
   */
  this.input.keyboard.addKey(store.getState().game.keyboardControls.reload).onUp.add(() => {
    const isPrimarySelected = store.getState().player.currentWeapon === 'primaryWeapon'
    const reloadTime = isPrimarySelected
      ? GameConsts.WEAPONS[store.getState().player.selectedPrimaryWeaponId].reloadTime
      : GameConsts.WEAPONS[store.getState().player.selectedSecondaryWeaponId].reloadTime

    if (
      isPrimarySelected &&
      (
        // Is ammo full already
        GameConsts.WEAPONS[store.getState().player.selectedPrimaryWeaponId].ammo === store.getState().player.primaryAmmoRemaining ||
        // Is reloading already
        store.getState().player.isPrimaryReloading
      )
    ) return

    if (
      !isPrimarySelected &&
      (
        // Is ammo full already
        GameConsts.WEAPONS[store.getState().player.selectedSecondaryWeaponId].ammo === store.getState().player.secondaryAmmoRemaining ||
        // Is reloading already
        store.getState().player.isSecondaryReloading
      )
    ) return

    isPrimarySelected
      ? store.dispatch(actions.player.setPrimaryIsReloading(true))
      : store.dispatch(actions.player.setSecondaryIsReloading(true))

    reloadHandle = setTimeout(() => {
      if (isPrimarySelected) {
        store.dispatch(actions.player.setPrimaryIsReloading(false))
        store.dispatch(actions.player.setPrimaryAmmoRemaining(GameConsts.WEAPONS[store.getState().player.selectedPrimaryWeaponId].ammo))
        return
      }

      store.dispatch(actions.player.setSecondaryIsReloading(false))
      store.dispatch(actions.player.setSecondaryAmmoRemaining(GameConsts.WEAPONS[store.getState().player.selectedSecondaryWeaponId].ammo))
    }, reloadTime)
  })

  /**
   * Switch weapons
   */
  this.input.keyboard.removeKey(lastSwitchWeaponKey)
  lastSwitchWeaponKey = store.getState().game.keyboardControls.switchWeapon
  this.input.keyboard.addKey(store.getState().game.keyboardControls.switchWeapon).onUp.add(() => {
    if (
      store.getState().player.health <= 0 ||
      store.getState().player.isSwitchingWeapon ||
      store.getState().room.state !== 'active'
    ) return

    // When you switch weapons stop the reloading process
    clearTimeout(reloadHandle)

    // Cancel reload action
    store.dispatch(actions.player.setHasCanceledReloading(true))
    store.dispatch(actions.player.setPrimaryIsReloading(false))
    store.dispatch(actions.player.setSecondaryIsReloading(false))

    const currentWeapon = store.getState().player.currentWeapon

    const nextWeapon = (currentWeapon === 'primaryWeapon') ? 'secondaryWeapon' : 'primaryWeapon'
    const nextWeaponConfig = store.getState().player[nextWeapon]
    const switchDelay = nextWeaponConfig.switchDelay || 0

    store.dispatch(actions.player.setIsSwitchingWeapon(true))

    // This is used because the sound file is fairly quiet compared to the rest of our sound effects.
    const volumeGain = 17

    // Audio cue to let the user know their gun is switching
    window.RS.switchingWeaponsFx.volume = store.getState().game.sfxVolume * volumeGain
    window.RS.switchingWeaponsFx.play()

    setTimeout(() => {
      store.dispatch(actions.player.setCurrentWeapon(nextWeapon))
      store.dispatch(actions.player.setIsSwitchingWeapon(false))

      const newCurrentWeapon = store.getState().player.currentWeapon
      const currentWeaponId = newCurrentWeapon === 'primaryWeapon'
        ? store.getState().player.selectedPrimaryWeaponId
        : store.getState().player.selectedSecondaryWeaponId

      window.RS.player.rightArmSprite.animations.frame = GameConsts.WEAPONS[currentWeaponId].frame

      ReloadGunWhenEmpty.call(this, currentWeaponId)

      // The sound effect is two seconds long so stop it once switching guns is complete.
      window.RS.switchingWeaponsFx.stop()
    }, switchDelay)
  })

  /**
   * Self-kill
   */
  this.input.keyboard.addKey(store.getState().game.keyboardControls.selfkill).onUp.add(() => {
    if (store.getState().room.state !== 'active') return
    KillCurrentPlayer.call(this)
  })
}
