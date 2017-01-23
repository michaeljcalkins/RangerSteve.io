import actions from '../actions'
import GameConsts from 'lib/GameConsts'

let reloadTimeout = null

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
    store.getState().player.isSwitchingWeapon ||
    isPrimarySelected && store.getState().player.isPrimaryReloading ||
    !isPrimarySelected && store.getState().player.isSecondaryReloading
  ) return

  // If empty set current gun to reloading
  if (isPrimarySelected) {
    store.dispatch(actions.player.setPrimaryIsReloading(true))
  } else {
    store.dispatch(actions.player.setSecondaryIsReloading(true))
  }

  clearTimeout(reloadTimeout)
  store.dispatch(actions.player.setHasCanceledReloading(false))

  reloadTimeout = setTimeout(() => {
    if (store.getState().player.hasCanceledReloading) {
      store.dispatch(actions.player.setHasCanceledReloading(false))
      store.dispatch(actions.player.setPrimaryIsReloading(false))
      store.dispatch(actions.player.setSecondaryIsReloading(false))
      return
    }

    if (isPrimarySelected) {
      store.dispatch(actions.player.setPrimaryIsReloading(false))
      store.dispatch(actions.player.setPrimaryAmmoRemaining(currentWeapon.ammo))
      return
    }

    store.dispatch(actions.player.setSecondaryIsReloading(false))
    store.dispatch(actions.player.setSecondaryAmmoRemaining(currentWeapon.ammo))
  }, currentWeapon.reloadTime)
}
