import Guid from './Guid'
import emitBulletFired from './SocketEvents/emitBulletFired'
import GameConsts from './GameConsts'
import actions from '../actions'

export default function FireStandardBullet() {
    const store = this.rootScope.game.store
    const state = store.getState()

    if (state.player.ammoRemaining <= 0) {
        return
    }

    let x = this.rootScope.player.x
    let y = this.rootScope.player.y - 10

    let bullet = this.rootScope.bullets.getFirstDead()

    // Define some shortcuts to some useful objects
    var body = bullet.body
    var features = this.rootScope.features

    // Update player body properties
    body.drag.x = features.dragX
    body.drag.y = features.dragY
    body.bounce.x = features.bounceX
    body.bounce.y = features.bounceY

    // Update player body Arcade Slopes properties
    body.slopes.friction.x = features.frictionX
    body.slopes.friction.y = features.frictionY
    body.slopes.preferY    = features.minimumOffsetY
    body.slopes.pullUp     = features.pullUp
    body.slopes.pullDown   = features.pullDown
    body.slopes.pullLeft   = features.pullLeft
    body.slopes.pullRight  = features.pullRight
    body.slopes.snapUp     = features.snapUp
    body.slopes.snapDown   = features.snapDown
    body.slopes.snapLeft   = features.snapLeft
    body.slopes.snapRight  = features.snapRight

    bullet.bulletId = Guid()
    bullet.damage = this.damage
    bullet.weaponId = this.meta.id
    bullet.alpha = 0
    bullet.body.gravity.y = -1150

    bullet.reset(x, y)
    let pointerAngle = this.rootScope.game.physics.arcade.moveToPointer(bullet, this.bulletSpeed)
    bullet.rotation = pointerAngle

    setTimeout(() => {
        bullet.alpha = this.bulletAlpha !== undefined ? this.bulletAlpha : 1
    }, 40)

    this.fx.volume = state.game.sfxVolume
    this.fx.play()

    if (store.getState().player.currentWeapon === 'primaryWeapon') {
        store.dispatch(actions.player.decrementPrimaryAmmoRemaining())
    } else {
        store.dispatch(actions.player.decrementSecondaryAmmoRemaining())
    }

    emitBulletFired.call(this.rootScope, {
        roomId: state.room.id,
        bulletId: bullet.bulletId,
        playerId: '/#' + window.socket.id,
        weaponId: this.meta.id,
        x,
        y,
        pointerAngle,
        bulletSpeed: this.bulletSpeed,
        damage: this.damage
    })

    const currentAmmoRemaining = store.getState().player.currentWeapon === 'primaryWeapon'
        ? store.getState().player.primaryAmmoRemaining
        : store.getState().player.secondaryAmmoRemaining

    if (currentAmmoRemaining <= 0 && ! store.getState().player.isReloading) {
        store.dispatch(actions.player.setIsReloading(true))

        const reloadTime = store.getState().player.currentWeapon === 'primaryWeapon'
            ? GameConsts.PRIMARY_WEAPONS[store.getState().player.selectedPrimaryWeaponId].reloadTime
            : GameConsts.SECONDARY_WEAPONS[store.getState().player.selectedSecondaryWeaponId].reloadTime

        const currentWeaponId = this.meta.id
        const currentWeapon = store.getState().player.currentWeapon
        setTimeout(() => {
            store.dispatch(actions.player.setIsReloading(false))
            if (currentWeapon === 'primaryWeapon') {
                store.dispatch(actions.player.setPrimaryAmmoRemaining(GameConsts.PRIMARY_WEAPONS[currentWeaponId].ammo))
                return
            }

            store.dispatch(actions.player.setSecondaryAmmoRemaining(GameConsts.SECONDARY_WEAPONS[currentWeaponId].ammo))
        }, reloadTime)
        return
    }
}
