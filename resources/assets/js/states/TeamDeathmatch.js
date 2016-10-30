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
import CreateHud from '../lib/CreateHandler/CreateHud'
import UpdateTeamColors from '../lib/UpdateTeamColors'
import PlayerAndPlatforms from '../lib/Collisions/PlayerAndPlatforms'
import PlayerAndEnemyTeamBullets from '../lib/Collisions/PlayerAndEnemyTeamBullets'
import BulletsAndEnemyTeamPlayers from '../lib/Collisions/BulletsAndEnemyTeamPlayers'
import BulletsAndPlatforms from '../lib/Collisions/BulletsAndPlatforms'
import EnemyBulletsAndPlatforms from '../lib/Collisions/EnemyBulletsAndPlatforms'

/**
 * Collisions and all game mode related interactions.
 */
function TeamDeathmatch(game) {
    this.game = game
}

TeamDeathmatch.prototype = {

    preload: function() {
        const store = this.game.store
        const mapName = store.getState().room.map
        Maps[mapName].preload.call(this)
    },

    create: function() {
        const store = this.game.store
        const { room } = store.getState()

        // Enables advanced profiling features when debugging
        this.game.time.advancedTiming = true

        // Adds slopes and other useful tiles to AABB collisions
        this.game.physics.startSystem(Phaser.Physics.ARCADE)
        this.game.plugins.add(Phaser.Plugin.ArcadeSlopes)
        this.game.physics.arcade.gravity.y = GameConsts.GRAVITY

        // Enemy remote players
        RS.enemies = this.game.add.group()
        RS.enemies.enableBody = true
        RS.enemies.physicsBodyType = Phaser.Physics.ARCADE
        this.game.physics.arcade.enable(RS.enemies)
        this.game.physics.enable(RS.enemies, Phaser.Physics.ARCADE)

        RS.jumpjetFx = this.game.add.audio('jumpjet')
        RS.switchingWeaponsFx = this.game.add.audio('switching-weapons')
        RS.headshotSound = this.game.add.audio('headshot')

        CreateMapAndPlayer.call(this)
        CreateHurtBorder.call(this)
        CreateKillingSpreeAudio.call(this)
        CreateDetectIdleUser()
        CreateBullets.call(this)
        CreateHud.call(this)
        CreateKeyboardBindings.call(this)

        window.socket.emit('refresh players', {
            roomId: room.id,
        })

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

        PlayerAndPlatforms.call(this)
        PlayerAndEnemyTeamBullets.call(this)
        BulletsAndEnemyTeamPlayers.call(this)
        EnemyBulletsAndPlatforms.call(this)
        BulletsAndPlatforms.call(this)
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
        UpdateTeamColors.call(this)
    },

    render() {
        if (! GameConsts.DEBUG || ! RS.player) return

        this.game.debug.text('FPS: ' + (this.time.fps || '--'), 10, 20, "#ffffff")
        this.game.debug.body(RS.player)
        this.game.debug.inputInfo(32, 200)
        this.game.debug.cameraInfo(this.camera, 32, 110)
        RS.bullets.forEach((bullet) => {
            this.game.debug.body(bullet)
        })

        RS.enemies.forEach((bullet) => {
            this.game.debug.body(bullet)
        })
    },

}

export default TeamDeathmatch
