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
import actions from '../actions'
import GameConsts from '../lib/GameConsts'
import UpdateHudPositions from '../lib/UpdateHudPositions'
import UpdateHurtBorder from '../lib/UpdateHurtBorder'
import UpdatePlayerPosition from '../lib/UpdatePlayerPosition'
import CreateKeyboardBindings from '../lib/CreateHandler/CreateKeyboardBindings'
import CreateHurtBorder from '../lib/CreateHandler/CreateHurtBorder'
import CreateMapAndPlayer from '../lib/CreateHandler/CreateMapAndPlayer'
import CreateBullets from '../lib/CreateHandler/CreateBullets'
import CreateDetectIdleUser from '../lib/CreateHandler/CreateDetectIdleUser'
import CreateKillingSpreeAudio from '../lib/CreateHandler/CreateKillingSpreeAudio'
import CreateUI from '../lib/CreateHandler/CreateUI'

function Deathmatch(game) {
    this.game = game
}

Deathmatch.prototype = {

    preload: function() {
        const store = this.game.store
        const mapName = store.getState().room.map
        Maps[mapName].preload.call(this)
    },

    create: function() {
        const store = this.game.store
        const { room } = store.getState()

        // Scale game on window resize
        // this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE
        // this.game.renderer.renderSession.roundPixels = true
        // this.game.stage.disableVisibilityChange = true
        // this.game.scale.refresh()

        // Enables advanced profiling features when debugging
        this.game.time.advancedTiming = true

        // Start up Arcade Physics
        this.game.physics.startSystem(Phaser.Physics.ARCADE)
        this.game.plugins.add(Phaser.Plugin.ArcadeSlopes)
        this.game.physics.arcade.gravity.y = GameConsts.GRAVITY

        // Enemy remote players
        RangerSteve.enemies = this.game.add.group()
        RangerSteve.enemies.enableBody = true
        RangerSteve.enemies.physicsBodyType = Phaser.Physics.ARCADE
        this.game.physics.arcade.enable(RangerSteve.enemies)
        this.game.physics.enable(RangerSteve.enemies, Phaser.Physics.ARCADE)

        RangerSteve.jumpjetFx = this.game.add.audio('jumpjet')
        RangerSteve.switchingWeaponsFx = this.game.add.audio('switching-weapons')
        RangerSteve.headshotSound = this.game.add.audio('headshot')

        CreateMapAndPlayer.call(this)
        CreateHurtBorder.call(this)
        CreateKillingSpreeAudio.call(this)
        CreateDetectIdleUser()
        CreateBullets.call(this)
        CreateUI.call(this)
        CreateKeyboardBindings.call(this)

        window.socket.emit('refresh players', {
            roomId: room.id
        })

        this.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT

        window.onresize = () => {
            const qualities = [1200, 600, 300]
            const scaleFactor = qualities[0]
            const innerWidth = window.innerWidth
            const innerHeight = window.innerHeight
            const gameRatio = innerWidth / innerHeight

            $("#ui-app").css({
                transform: "scale(" + Math.min(innerWidth / 1200, 1) + ")",
                "transform-origin": "top right"
            })

            this.game.scale.setGameSize(Math.ceil(scaleFactor * gameRatio), scaleFactor)
        }

        const qualities = [1200, 600, 300]
        const scaleFactor = qualities[0]
        const innerWidth = window.innerWidth
        const innerHeight = window.innerHeight
        const gameRatio = innerWidth / innerHeight
        this.game.scale.setGameSize(Math.ceil(scaleFactor * gameRatio), scaleFactor)

        this.game.paused = false
    },

    update: function() {
        if (this.game.store.getState().game.resetEventsFlag) {
            this.game.store.dispatch(actions.game.setResetEventsFlag(false))
            CreateKeyboardBindings.call(this)
        }

        const state = this.game.store.getState()
        const player = state.player
        const currentWeaponId = player.currentWeapon === 'primaryWeapon'
            ? player.selectedPrimaryWeaponId
            : player.selectedSecondaryWeaponId

        if (state.game.state === 'ended' || ! state.room) {
            this.game.paused = true
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
        // TODO FireWeaponIfActive.call(this)
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
    },

    render() {
        if (! GameConsts.DEBUG || ! RangerSteve.player) return

        this.game.debug.text('FPS: ' + (this.time.fps || '--'), 10, 20, "#ffffff")
        this.game.debug.body(RangerSteve.player)
        this.game.debug.inputInfo(32, 200)
        this.game.debug.cameraInfo(this.camera, 32, 110)
        RangerSteve.bullets.forEach((bullet) => {
            this.game.debug.body(bullet)
        })

        RangerSteve.enemies.forEach((bullet) => {
            this.game.debug.body(bullet)
        })
    }

}

export default Deathmatch
