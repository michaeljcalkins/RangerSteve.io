import Guid from './Guid'
import emitBulletFired from './SocketEvents/emitBulletFired'
import GameConsts from './GameConsts'
import actions from '../actions'

export default function FireRocket() {
    const store = this.rootScope.game.store
    const state = this.rootScope.game.store.getState()

    let x = this.rootScope.player.x
    let y = this.rootScope.player.y - 10

    let bullet = this.rootScope.bullets.getFirstDead()

    // Define some shortcuts to some useful objects
    var body = bullet.body

    // Update player body properties
    body.drag.x = GameConsts.SLOPE_FEATURES.dragX
    body.drag.y = GameConsts.SLOPE_FEATURES.dragY
    body.bounce.x = GameConsts.SLOPE_FEATURES.bounceX
    body.bounce.y = GameConsts.SLOPE_FEATURES.bounceY

    // Update player body Arcade Slopes properties
    body.slopes.friction.x = GameConsts.SLOPE_FEATURES.frictionX
    body.slopes.friction.y = GameConsts.SLOPE_FEATURES.frictionY
    body.slopes.preferY    = GameConsts.SLOPE_FEATURES.minimumOffsetY
    body.slopes.pullUp     = GameConsts.SLOPE_FEATURES.pullUp
    body.slopes.pullDown   = GameConsts.SLOPE_FEATURES.pullDown
    body.slopes.pullLeft   = GameConsts.SLOPE_FEATURES.pullLeft
    body.slopes.pullRight  = GameConsts.SLOPE_FEATURES.pullRight
    body.slopes.snapUp     = GameConsts.SLOPE_FEATURES.snapUp
    body.slopes.snapDown   = GameConsts.SLOPE_FEATURES.snapDown
    body.slopes.snapLeft   = GameConsts.SLOPE_FEATURES.snapLeft
    body.slopes.snapRight  = GameConsts.SLOPE_FEATURES.snapRight

    bullet.bulletId = Guid()
    bullet.damage = this.damage
    bullet.weaponId = this.meta.id
    bullet.alpha = 0
    bullet.body.gravity.y = -1150
    bullet.height = 10
    bullet.width = 40
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
