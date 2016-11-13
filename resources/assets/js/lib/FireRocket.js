import Guid from './Guid'
import emitBulletFired from './SocketEvents/emitBulletFired'
import GameConsts from 'lib/GameConsts'
import actions from '../actions'
import ReloadGunWhenEmpty from './ReloadGunWhenEmpty'

let muzzleFlashHandler = null
let nextFire = null

export default function FireRocket(currentWeaponId) {
    const store = this.game.store
    const state = store.getState()
    const currentWeapon = GameConsts.WEAPONS[currentWeaponId]

    if (
        ! state.room.id ||
        state.player.health <= 0 ||
        state.room.state !== 'active' ||
        this.game.time.time < nextFire ||
        RS.bullets.countDead() <= 0
    ) return

    nextFire = this.game.time.time + currentWeapon.fireRate

    let x = RS.player.x
    let y = RS.player.y - 10

    let bullet = RS.bullets.getFirstDead()
    bullet.bulletId = Guid()
    bullet.damage = this.damage
    bullet.weaponId = currentWeaponId
    bullet.alpha = 0
    bullet.height = 10
    bullet.width = 40
    bullet.reset(x, y)
    let pointerAngle = this.game.physics.arcade.moveToPointer(bullet, currentWeapon.bulletSpeed)
    bullet.rotation = pointerAngle

    // Show the muzzle flash for a short period of time and hide it unless the user is holding down fire.
    RS.rightArmSprite.animations.frame = GameConsts.WEAPONS[currentWeaponId].shootingFrame
    clearTimeout(muzzleFlashHandler)
    muzzleFlashHandler = setTimeout(() => {
        RS.rightArmSprite.animations.frame = GameConsts.WEAPONS[currentWeaponId].frame
    }, 60)

    // Shake camera for gun recoil
    this.camera.shake(0.01, 150, true)

    // Shows the bullet after it has left the barrel so you don't have to line up the bullet with the barrel.
    setTimeout(() => {
        bullet.alpha = this.bulletAlpha !== undefined ? this.bulletAlpha : 1
    }, 60)

    RS.weaponSoundEffects[currentWeaponId].volume = state.game.sfxVolume
    RS.weaponSoundEffects[currentWeaponId].play()

    if (store.getState().player.currentWeapon === 'primaryWeapon') {
        store.dispatch(actions.player.decrementPrimaryAmmoRemaining())
    } else {
        store.dispatch(actions.player.decrementSecondaryAmmoRemaining())
    }

    emitBulletFired.call(this, {
        bulletId: bullet.bulletId,
        weaponId: currentWeaponId,
        x,
        y,
        pointerAngle,
        bulletSpeed: currentWeapon.bulletSpeed,
        damage: currentWeapon.damage,
    })

    ReloadGunWhenEmpty.call(this, currentWeaponId)
}
