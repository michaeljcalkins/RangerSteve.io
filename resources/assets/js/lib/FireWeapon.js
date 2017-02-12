import GameConsts from 'lib/GameConsts'
import logPointerWorldPosition from '../lib/logPointerWorldPosition'
import FireStandardBullet from '../lib/FireStandardBullet'
import FireShotgunShell from '../lib/FireShotgunShell'
import FireRocket from '../lib/FireRocket'

export default function FireWeapon (currentWeaponId) {
  if (GameConsts.DEBUG) {
    // logPointerWorldPosition.call(this)
  }

  const player = this.game.store.getState().player

  if (player.isSwitchingWeapon) return

  const currentWeapon = GameConsts.WEAPONS[currentWeaponId]

  // Check if primary gun has ammo and is selected
  if (
    player.currentWeapon === 'primaryWeapon' &&
    (
      player.isPrimaryReloading ||
      player.primaryAmmoRemaining <= 0
    )
  ) return

  // Check if secondary gun has ammo and is selected
  if (
    player.currentWeapon === 'secondaryWeapon' &&
    (
      player.isSecondaryReloading ||
      player.secondaryAmmoRemaining <= 0
    )
  ) return

  switch (currentWeapon.bulletType) {
    case 'rocket':
      FireRocket.call(this, currentWeaponId)
      break

    case 'shotgun':
      FireShotgunShell.call(this, currentWeaponId)
      break

    default:
      FireStandardBullet.call(this, currentWeaponId)
  }
}
