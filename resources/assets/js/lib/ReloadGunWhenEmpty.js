import actions from '../actions'
import GameConsts from 'lib/GameConsts'

export default function(currentWeaponId) {
  const store = this.game.store
  const isPrimarySelected = store.getState().player.currentWeapon === 'primaryWeapon'
  const currentWeapon = GameConsts.WEAPONS[currentWeaponId]


    // Get ammo remaining in current gun
  const currentAmmoRemaining = isPrimarySelected
        ? store.getState().player.primaryAmmoRemaining
        : store.getState().player.secondaryAmmoRemaining

  if (
        currentAmmoRemaining <= 0 &&
        (
            (isPrimarySelected && ! store.getState().player.isPrimaryReloading) ||
            (! isPrimarySelected && ! store.getState().player.isSecondaryReloading)
        )
    ) {
        // If empty set current gun to reloading
    if (isPrimarySelected) {
      store.dispatch(actions.player.setPrimaryIsReloading(true))
    } else {
      store.dispatch(actions.player.setSecondaryIsReloading(true))
    }

        // Get reload time in seconds
    setTimeout(() => {
      if (isPrimarySelected) {
        store.dispatch(actions.player.setPrimaryIsReloading(false))
        store.dispatch(actions.player.setPrimaryAmmoRemaining(currentWeapon.ammo))
        return
      }

      store.dispatch(actions.player.setSecondaryIsReloading(false))
      store.dispatch(actions.player.setSecondaryAmmoRemaining(currentWeapon.ammo))
    }, currentWeapon.reloadTime)
    return
  }
}
