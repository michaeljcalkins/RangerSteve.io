import emitBulletFired from './SocketEvents/emitBulletFired'
import GameConsts from 'lib/GameConsts'
import actions from '../actions'

let muzzleFlashHandler = null
let nextFire = null
let lastWeaponId = null

export default function FireRocket (currentWeaponId) {
  const store = this.game.store
  const state = store.getState()
  const currentWeapon = GameConsts.WEAPONS[currentWeaponId]

  // Reset the fire rate if the user switched to a new gun (i.e. Barrett to Desert Eagle)
  nextFire = lastWeaponId === currentWeaponId
    ? nextFire
    : null

  lastWeaponId = currentWeaponId

  if (
    !state.room.id ||
    state.player.health <= 0 ||
    state.room.state !== 'active' ||
    this.game.time.time < nextFire ||
    !window.RS.bullets
  ) return

  nextFire = this.game.time.time + currentWeapon.fireRate

  let x = window.RS.player.x
  let y = window.RS.player.y - 10

  let bullet = window.RS.bullets.getFirstDead()
  if (!bullet) return console.error('No bullet sprite available.')

  bullet.bulletId = Math.round(Math.random() * 16000)
  bullet.damage = this.damage
  bullet.weaponId = currentWeaponId
  bullet.alpha = 0
  bullet.height = 10
  bullet.width = 40
  bullet.reset(x, y)
  let pointerAngle = this.game.physics.arcade.moveToPointer(bullet, currentWeapon.bulletSpeed)
  bullet.rotation = pointerAngle

  // Show the muzzle flash for a short period of time and hide it unless the user is holding down fire.
  window.RS.player.rightArmSprite.animations.frame = GameConsts.WEAPONS[currentWeaponId].shootingFrame
  clearTimeout(muzzleFlashHandler)
  muzzleFlashHandler = setTimeout(() => {
    window.RS.player.rightArmSprite.animations.frame = GameConsts.WEAPONS[currentWeaponId].frame
  }, 60)

  // Shake camera for gun recoil
  this.camera.shake(0.01, 150, true)

  // Shows the bullet after it has left the barrel so you don't have to line up the bullet with the barrel.
  setTimeout(() => {
    bullet.alpha = this.bulletAlpha !== undefined ? this.bulletAlpha : 1
  }, 60)

  window.RS.weaponSoundEffects[currentWeaponId].volume = state.game.sfxVolume
  window.RS.weaponSoundEffects[currentWeaponId].play()

  if (store.getState().player.currentWeapon === 'primaryWeapon') {
    store.dispatch(actions.player.decrementPrimaryAmmoRemaining())
  } else {
    store.dispatch(actions.player.decrementSecondaryAmmoRemaining())
  }

  emitBulletFired.call(this, {
    bulletId: bullet.bulletId,
    pointerAngle,
    weaponId: currentWeaponId,
    x: Math.round(Math.max(0, x)),
    y: Math.round(Math.max(0, y))
  })
}
