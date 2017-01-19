import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'
import updatePlayerAngles from '../lib/updatePlayerAngles'
import FireStandardBullet from '../lib/FireStandardBullet'
import FireShotgunShell from '../lib/FireShotgunShell'
import FireRocket from '../lib/FireRocket'
import RotateBulletsToTrajectory from '../lib/RotateBulletsToTrajectory'
import Maps from '../lib/Maps'
import Client from '../lib/Client'
import actions from '../actions'
import GameConsts from 'lib/GameConsts'
import UpdateHurtBorder from '../lib/UpdateHurtBorder'
import UpdatePlayerPosition from '../lib/UpdatePlayerPosition'
import CreateKeyboardBindings from '../lib/CreateHandler/CreateKeyboardBindings'
import CreateHurtBorder from '../lib/CreateHandler/CreateHurtBorder'
import CreateMapAndPlayer from '../lib/CreateHandler/CreateMapAndPlayer'
import CreateBullets from '../lib/CreateHandler/CreateBullets'
import CreateKillingSpreeAudio from '../lib/CreateHandler/CreateKillingSpreeAudio'
import CreateDetectIdleUser from '../lib/CreateHandler/CreateDetectIdleUser'
import PlayerAndPlatforms from '../lib/Collisions/PlayerAndPlatforms'
import PlayerAndEnemyTeamBullets from '../lib/Collisions/PlayerAndEnemyTeamBullets'
import BulletsAndEnemyTeamPlayers from '../lib/Collisions/BulletsAndEnemyTeamPlayers'
import BulletsAndPlatforms from '../lib/Collisions/BulletsAndPlatforms'
import EnemyBulletsAndPlatforms from '../lib/Collisions/EnemyBulletsAndPlatforms'
import UpdateGameScale from '../lib/UpdateGameScale'
import logPointerWorldPosition from '../lib/logPointerWorldPosition'
import createEnemyGroup from '../lib/createEnemyGroup'

/**
 * Collisions and all game mode related interactions.
 */
function TeamDeathmatch (game) {
  this.game = game
}

TeamDeathmatch.prototype = {

  preload () {
    const store = this.game.store
    const mapName = store.getState().room.map
    Maps[mapName].preload.call(this)
  },

  create () {
    createEnemyGroup.call(this)
    CreateMapAndPlayer.call(this)
    CreateHurtBorder.call(this)
    CreateKillingSpreeAudio.call(this)
    CreateBullets.call(this)
    CreateKeyboardBindings.call(this)
    CreateDetectIdleUser()

    window.onresize = UpdateGameScale.bind(this)
    UpdateGameScale.call(this)
    Client.send(GameConsts.EVENT.REFRESH_ROOM)

    this.game.paused = false
  },

  update () {
    if (this.game.store.getState().game.resetEventsFlag) {
      this.game.store.dispatch(actions.game.setResetEventsFlag(false))
      CreateKeyboardBindings.call(this)
    }

    const state = this.game.store.getState()
    const player = state.player
    const currentWeaponId = player.currentWeapon === 'primaryWeapon'
            ? player.selectedPrimaryWeaponId
            : player.selectedSecondaryWeaponId

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
      updatePlayerAngles.call(this, window.RS.player)
    }

        /**
         * Fire current weapon
         */
        // TODO FireWeaponIfActive.call(this)
    if (this.game.input.activePointer.leftButton.isDown) {
      const currentWeapon = GameConsts.WEAPONS[currentWeaponId]

      if (GameConsts.DEBUG) {
        logPointerWorldPosition.call(this)
      }

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

      switch (currentWeapon.bulletType) {
        case 'rocket':
          FireRocket.call(this, currentWeaponId)
          break

        case 'shotgun':
          FireShotgunShell.call(this, currentWeaponId)
          break

        default:
          FireStandardBullet.call(this, currentWeaponId)
      }
    }

    RotateBulletsToTrajectory.call(this)
    UpdateHurtBorder.call(this)
    UpdatePlayerPosition.call(this)
  },

  render () {
    if (!GameConsts.DEBUG || !window.RS.player) return

    this.game.debug.text('FPS: ' + (this.time.fps || '--'), 10, 20, '#ffffff')
    this.game.debug.body(window.RS.player)
    this.game.debug.inputInfo(32, 200)
    this.game.debug.cameraInfo(this.camera, 32, 110)
    window.RS.bullets.forEach((bullet) => {
      this.game.debug.body(bullet)
    })

    window.RS.enemies.forEach((bullet) => {
      this.game.debug.body(bullet)
    })
  }
}

export default TeamDeathmatch
