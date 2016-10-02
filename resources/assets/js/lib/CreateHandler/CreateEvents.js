import actions from '../../actions'
import GameConsts from '../GameConsts'

let lastSwitchWeaponKey = null

export default function() {
    const store = this.game.store

    /**
     * Open settings modal
     */
    this.input.keyboard.addKey(Phaser.Keyboard.TAB).onDown.add(() => {
        store.dispatch(actions.game.openLeaderboardModal())
    })

    this.input.keyboard.addKey(Phaser.Keyboard.TAB).onUp.add(() => {
        store.dispatch(actions.game.closeLeaderboardModal())
    })

    /**
     * Reload current gun
     */
    this.input.keyboard.addKey(store.getState().game.keyboardControls.reload).onUp.add(() => {
        const isPrimarySelected = store.getState().player.currentWeapon === 'primaryWeapon'
        const reloadTime = isPrimarySelected
            ? GameConsts.WEAPONS[store.getState().player.selectedPrimaryWeaponId].reloadTime
            : GameConsts.WEAPONS[store.getState().player.selectedSecondaryWeaponId].reloadTime

        if (isPrimarySelected) {
            store.dispatch(actions.player.setPrimaryIsReloading(true))
        } else {
            store.dispatch(actions.player.setSecondaryIsReloading(true))
        }

        setTimeout(() => {
            if (isPrimarySelected) {
                store.dispatch(actions.player.setPrimaryIsReloading(false))
                store.dispatch(actions.player.setPrimaryAmmoRemaining(GameConsts.WEAPONS[store.getState().player.selectedPrimaryWeaponId].ammo))
                return
            }

            store.dispatch(actions.player.setSecondaryIsReloading(false))
            store.dispatch(actions.player.setSecondaryAmmoRemaining(GameConsts.WEAPONS[store.getState().player.selectedSecondaryWeaponId].ammo))
        }, reloadTime)
    })

    /**
     * Switch weapons
     */
    this.input.keyboard.removeKey(lastSwitchWeaponKey)
    lastSwitchWeaponKey = store.getState().game.keyboardControls.switchWeapon
    this.input.keyboard.addKey(store.getState().game.keyboardControls.switchWeapon).onUp.add(() => {
        if (store.getState().player.health <= 0) return

        const currentWeapon = store.getState().player.currentWeapon

        if (currentWeapon === 'primaryWeapon') {
            store.dispatch(actions.player.setCurrentWeapon('secondaryWeapon'))
        } else {
            store.dispatch(actions.player.setCurrentWeapon('primaryWeapon'))
        }

        const newCurrentWeapon = store.getState().player.currentWeapon
        const currentWeaponId = newCurrentWeapon === 'primaryWeapon'
            ? store.getState().player.selectedPrimaryWeaponId
            : store.getState().player.selectedSecondaryWeaponId

        this.rightArmSprite.animations.frame = GameConsts.WEAPONS[currentWeaponId].frame
        this.muzzleFlash.x = GameConsts.WEAPONS[currentWeaponId].position.muzzleFlashX
        this.muzzleFlash.y = GameConsts.WEAPONS[currentWeaponId].position.muzzleFlashY
    })
}
