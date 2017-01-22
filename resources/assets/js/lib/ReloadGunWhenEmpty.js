import actions from '../actions'
import GameConsts from 'lib/GameConsts'

export default function (currentWeaponId) {
  const store = this.game.store
  const isPrimarySelected = store.getState().player.currentWeapon === 'primaryWeapon'
  const currentWeapon = GameConsts.WEAPONS[currentWeaponId]

  // Get ammo remaining in current gun
  const currentAmmoRemaining = isPrimarySelected
    ? store.getState().player.primaryAmmoRemaining
    : store.getState().player.secondaryAmmoRemaining

  if (
    currentAmmoRemaining > 0 ||
    store.getState().player.isPrimaryReloading ||
    store.getState().player.isSecondaryReloading
  ) return

  // If empty set current gun to reloading
  if (isPrimarySelected) {
    store.dispatch(actions.player.setPrimaryIsReloading(true))
  } else {
    store.dispatch(actions.player.setSecondaryIsReloading(true))
  }

  // Get reload time in seconds
  setTimeout(() => {
    if (store.getState().player.hasCaneledReloading) {
      store.dispatch(actions.player.setHasCanceledReloading(false))
      return
    }

    if (isPrimarySelected && store.getState().player.isPrimaryReloading) {
      store.dispatch(actions.player.setPrimaryIsReloading(false))
      store.dispatch(actions.player.setPrimaryAmmoRemaining(currentWeapon.ammo))
      return
    }

    if (store.getState().player.isSecondaryReloading) {
      store.dispatch(actions.player.setSecondaryIsReloading(false))
      store.dispatch(actions.player.setSecondaryAmmoRemaining(currentWeapon.ammo))
    }
  }, currentWeapon.reloadTime)
}
