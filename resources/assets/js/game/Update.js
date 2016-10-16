import CollisionHandler from '../lib/CollisionHandler'
import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'
import PlayerAngleHandler from '../lib/PlayerAngleHandler'
import FireStandardBullet from '../lib/FireStandardBullet'
import FireShotgunShell from '../lib/FireShotgunShell'
import FireRocket from '../lib/FireRocket'
import Maps from '../lib/Maps'
import InitEvents from '../lib/CreateHandler/CreateKeyboardBindings'
import actions from '../actions'
import GameConsts from '../lib/GameConsts'
import UpdateHudPositions from '../lib/UpdateHudPositions'
import UpdateHurtBorder from '../lib/UpdateHurtBorder'
import UpdatePlayerPosition from '../lib/UpdatePlayerPosition'

export default function Update() {
    if (this.game.store.getState().game.resetEventsFlag) {
        this.game.store.dispatch(actions.game.setResetEventsFlag(false))
        InitEvents.call(this)
    }

    const state = this.game.store.getState()
    const player = state.player
    const currentWeaponId = player.currentWeapon === 'primaryWeapon'
        ? player.selectedPrimaryWeaponId
        : player.selectedSecondaryWeaponId

    if (state.game.state !== 'active' || ! state.room) return

    UpdateHudPositions.call(this)

    // Pause controls so user can't do anything in the background accidentally
    const isPaused = state.game.settingsModalIsOpen || state.game.chatModalIsOpen || state.player.health <= 0
    this.game.input.enabled = !isPaused

    CollisionHandler.call(this)
    Maps[state.room.map].update.call(this)

    /**
     * User related movement and sprite angles
     */
    if (state.player.health > 0) {
        PlayerMovementHandler.call(this)
        PlayerJumpHandler.call(this)
        PlayerAngleHandler.call(this)
    }

    /**
     * Fire current weapon
     */
    if (this.game.input.activePointer.leftButton.isDown) {
        const currentWeapon = GameConsts.WEAPONS[currentWeaponId]

        if (player.isSwitchingWeapon) return

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

        switch(currentWeapon.bulletType) {
            case 'rocket':
                FireRocket.call(this, currentWeaponId)
                break;

            case 'shotgun':
                FireShotgunShell.call(this, currentWeaponId)
                break

            default:
                FireStandardBullet.call(this, currentWeaponId)
        }
    }

    /**
     * Rotate bullets according to trajectory
     */
    this.bullets.forEach((bullet) => {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
    })

    this.enemyBullets.forEach((bullet) => {
        bullet.rotation = Math.atan2(bullet.body.velocity.y, bullet.body.velocity.x)
    })

    UpdatePlayerPosition.call(this)
    UpdateHurtBorder.call(this)

    this.hurtBorderSprite.width = window.innerWidth
    this.hurtBorderSprite.height = window.innerHeight
}
