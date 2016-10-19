// init
// preload
// loadUpdate
// loadRender
// create
// update
// preRender
// render
// resize
// paused
// resumed
// pauseUpdate
// shutdown

/**
 * Collisions and all game mode related interactions.
 */
import CollisionHandler from '../lib/CollisionHandler'
import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'
import PlayerAngleHandler from '../lib/PlayerAngleHandler'
import FireStandardBullet from '../lib/FireStandardBullet'
import FireShotgunShell from '../lib/FireShotgunShell'
import FireRocket from '../lib/FireRocket'
import RotateBulletsToTrajectory from '../lib/RotateBulletsToTrajectory'
import Maps from '../lib/Maps'
import InitEvents from '../lib/CreateHandler/CreateKeyboardBindings'
import actions from '../actions'
import GameConsts from '../lib/GameConsts'
import UpdateHudPositions from '../lib/UpdateHudPositions'
import UpdateHurtBorder from '../lib/UpdateHurtBorder'
import UpdatePlayerPosition from '../lib/UpdatePlayerPosition'
import CreateHandler from '../lib/CreateHandler'

function Deathmatch(game) {
    this.game = game
}

Deathmatch.prototype = {

    preload: function() {
        console.log('Deathmatch')
        const store = this.game.store
        const mapName = store.getState().room.map
        Maps[mapName].preload.call(this)
    },

    create: function() {
        CreateHandler.call(this)
    },

    update: function() {
        if (this.game.store.getState().game.resetEventsFlag) {
            this.game.store.dispatch(actions.game.setResetEventsFlag(false))
            InitEvents.call(this)
        }

        const state = this.game.store.getState()
        const player = state.player
        const currentWeaponId = player.currentWeapon === 'primaryWeapon'
            ? player.selectedPrimaryWeaponId
            : player.selectedSecondaryWeaponId

        if (state.game.state === 'ended' || ! state.room) {
            this.game.state.start('EndOfRound')
        }

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

        RotateBulletsToTrajectory.call(this)
        UpdatePlayerPosition.call(this)
        UpdateHurtBorder.call(this)

        this.hurtBorderSprite.width = window.innerWidth
        this.hurtBorderSprite.height = window.innerHeight
    },

    render() {
        if (! GameConsts.DEBUG || ! this.player) return

        this.game.debug.text('FPS: ' + (this.time.fps || '--'), 10, 20, "#ffffff")
        this.game.debug.body(this.player)
        this.game.debug.inputInfo(32, 200)
        this.game.debug.cameraInfo(this.camera, 32, 110)
        this.bullets.forEach((bullet) => {
            this.game.debug.body(bullet)
        })

        this.enemies.forEach((bullet) => {
            this.game.debug.body(bullet)
        })
    }

}

export default Deathmatch