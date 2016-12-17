import Guid from './Guid'
import emitBulletFired from './SocketEvents/emitBulletFired'
import GameConsts from 'lib/GameConsts'
import actions from '../actions'
import ReloadGunWhenEmpty from './ReloadGunWhenEmpty'
import range from 'lodash/range'
import sample from 'lodash/sample'

const rangeOfVariance = range(-.12, .12, .01)
let muzzleFlashHandler = null
let nextFire = null

export default function FireShotgunShell(currentWeaponId) {
    const store = this.game.store
    const state = store.getState()
    const currentWeapon = GameConsts.WEAPONS[currentWeaponId]
    const isPrimarySelected = store.getState().player.currentWeapon === 'primaryWeapon'

    if (
        ! state.room.id ||
        state.player.health <= 0 ||
        state.room.state !== 'active' ||
        this.game.time.time < nextFire ||
        RS.bullets.countDead() <= 0
    ) return

    if (this.game.time.time < nextFire || RS.bullets.countDead() <= 0)
        return

    nextFire = this.game.time.time + currentWeapon.fireRate

    let x = RS.player.x
    let y = RS.player.y - 10

    let pointerAngle = null
    for (var i = 0; i < 4; i++) {
        let bullet = RS.bullets.getFirstDead()
        bullet.bulletId = (Math.random()*10000).toFixed(0)
        bullet.damage = currentWeapon.damage
        bullet.weaponId = currentWeaponId
        bullet.alpha = 0
        bullet.height = 2
        bullet.width = 40
        bullet.reset(x, y)

        let socketPointerAngle = null
        if (pointerAngle === null) {
            pointerAngle = this.game.physics.arcade.moveToPointer(bullet, currentWeapon.bulletSpeed)
            bullet.rotation = pointerAngle
            socketPointerAngle = pointerAngle
        } else {
            let randomPointerAngle = sample(rangeOfVariance) + pointerAngle
            let newVelocity = this.game.physics.arcade.velocityFromRotation(randomPointerAngle, currentWeapon.bulletSpeed)
            bullet.body.velocity.x += newVelocity.x
            bullet.body.velocity.y += newVelocity.y
            bullet.rotation = randomPointerAngle
            socketPointerAngle = randomPointerAngle
        }

        // Shows the bullet after it has left the barrel so you don't have to line up the bullet with the barrel.
        setTimeout(function() {
            bullet.alpha = 1
        }, 40)

        emitBulletFired.call(this, {
            bulletId: bullet.bulletId,
            pointerAngle: socketPointerAngle,
            weaponId: currentWeaponId,
            x: Math.abs(x),
            y: Math.abs(y),
        })
    }

    // Show the muzzle flash for a short period of time and hide it unless the user is holding down fire.
    RS.player.rightArmSprite.animations.frame = GameConsts.WEAPONS[currentWeaponId].shootingFrame
    clearTimeout(muzzleFlashHandler)
    muzzleFlashHandler = setTimeout(() => {
        RS.player.rightArmSprite.animations.frame = GameConsts.WEAPONS[currentWeaponId].frame
    }, 60)

    // Shake camera for gun recoil
    this.camera.shake(0.0015, 100, true)

    RS.weaponSoundEffects[currentWeaponId].volume = state.game.sfxVolume
    RS.weaponSoundEffects[currentWeaponId].play()

    if (isPrimarySelected) {
        store.dispatch(actions.player.decrementPrimaryAmmoRemaining())
    } else {
        store.dispatch(actions.player.decrementSecondaryAmmoRemaining())
    }

    ReloadGunWhenEmpty.call(this, currentWeaponId)
}
