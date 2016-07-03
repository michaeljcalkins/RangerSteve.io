import Guid from './Guid'
import emitBulletFired from './SocketEvents/emitBulletFired'
import GameConsts from './GameConsts'
import actions from '../actions'

const rangeOfVariance = _.range(-.12, .12, .01)

export default function FireShotgunShell() {
    const store = this.rootScope.game.store
    const state = store.getState()

    let x = this.rootScope.player.x
    let y = this.rootScope.player.y - 10

    let pointerAngle = null
    for (var i = 0; i < 4; i++) {
        let bullet = this.rootScope.bullets.getFirstDead()
        bullet.bulletId = Guid()
        bullet.damage = this.damage
        bullet.weaponId = this.meta.id
        bullet.height = 2
        bullet.width = 40
        bullet.body.gravity.y = -1150
        bullet.alpha = 1
        bullet.reset(x, y)

        let socketPointerAngle = null
        if (pointerAngle === null) {
            pointerAngle = this.rootScope.game.physics.arcade.moveToPointer(bullet, this.bulletSpeed)
            bullet.rotation = pointerAngle
            socketPointerAngle = pointerAngle
        } else {
            let randomPointerAngle = _.sample(rangeOfVariance) + pointerAngle
            let newVelocity = this.game.physics.arcade.velocityFromRotation(randomPointerAngle, this.bulletSpeed)
            bullet.body.velocity.x += newVelocity.x
            bullet.body.velocity.y += newVelocity.y
            bullet.rotation = randomPointerAngle
            socketPointerAngle = randomPointerAngle
        }

        setTimeout(function() {
            bullet.alpha = 1
        }, 40)

        emitBulletFired.call(this.rootScope, {
            roomId: state.room.id,
            bulletId: bullet.bulletId,
            playerId: '/#' + window.socket.id,
            weaponId: this.meta.id,
            x,
            y,
            pointerAngle: socketPointerAngle,
            bulletSpeed: this.bulletSpeed,
            damage: this.damage
        })
    }

    if (store.getState().player.currentWeapon === 'primaryWeapon') {
        store.dispatch(actions.player.decrementPrimaryAmmoRemaining())
    } else {
        store.dispatch(actions.player.decrementSecondaryAmmoRemaining())
    }

    this.fx.volume = state.game.sfxVolume
    this.fx.play()

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
