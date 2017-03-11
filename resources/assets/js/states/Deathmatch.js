import PlayerMovementHandler from '../lib/PlayerMovementHandler'
import PlayerJumpHandler from '../lib/PlayerJumpHandler'
import RotateBulletsToTrajectory from '../lib/RotateBulletsToTrajectory'
import Maps from '../lib/Maps'
import Client from '../lib/Client'
import actions from '../actions'
import GameConsts from 'lib/GameConsts'
import UpdateHurtBorder from '../lib/UpdateHurtBorder'
import UpdatePlayerPosition from '../lib/UpdatePlayerPosition'
import UpdateEnemyPositions from '../lib/UpdateEnemyPositions'
import CreateKeyboardBindings from '../lib/CreateHandler/CreateKeyboardBindings'
import CreateHurtBorder from '../lib/CreateHandler/CreateHurtBorder'
import CreateMapAndPlayer from '../lib/CreateHandler/CreateMapAndPlayer'
import CreateBullets from '../lib/CreateHandler/CreateBullets'
import CreateKillingSpreeAudio from '../lib/CreateHandler/CreateKillingSpreeAudio'
import PlayerAndPlatforms from '../lib/Collisions/PlayerAndPlatforms'
import PlayerAndEnemyBullets from '../lib/Collisions/PlayerAndEnemyBullets'
import BulletsAndEnemyPlayers from '../lib/Collisions/BulletsAndEnemyPlayers'
import BulletsAndPlatforms from '../lib/Collisions/BulletsAndPlatforms'
import EnemyBulletsAndPlatforms from '../lib/Collisions/EnemyBulletsAndPlatforms'
import UpdateGameScale from '../lib/UpdateGameScale'
import createEnemyGroup from '../lib/createEnemyGroup'
import FireWeapon from '../lib/FireWeapon'
import ReloadGunWhenEmpty from '../lib/ReloadGunWhenEmpty'
import createEnemyPlayers from '../lib/createEnemyPlayers'

let polygonsHaveBeenDrawn = false

/**
 * Collisions and all game mode related interactions.
 */
function Deathmatch (game) {
  this.game = game
}

Deathmatch.prototype = {

  preload: function () {
    const store = this.game.store
    const mapName = store.getState().room.map
    Maps[mapName].preload.call(this)
  },

  create: function () {
    createEnemyGroup.call(this)
    CreateMapAndPlayer.call(this)
    CreateHurtBorder.call(this)
    CreateKillingSpreeAudio.call(this)
    CreateBullets.call(this)
    CreateKeyboardBindings.call(this)

    window.onresize = UpdateGameScale.bind(this)
    UpdateGameScale.call(this)

    createEnemyPlayers.call(this)

    this.game.paused = false

    document.getElementById('loading-screen').style.display = 'none'
    Client.send(GameConsts.EVENT.LOAD_COMPLETE)
  },

  update: function () {
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
    PlayerAndEnemyBullets.call(this)
    BulletsAndEnemyPlayers.call(this)
    EnemyBulletsAndPlatforms.call(this)
    BulletsAndPlatforms.call(this)
    Maps[state.room.map].update && Maps[state.room.map].update.call(this)

    /**
     * User related movement and sprite angles
     */
    if (state.player.health > 0) {
      PlayerMovementHandler.call(this)
      PlayerJumpHandler.call(this)
    }

    /**
     * Fire current weapon
     */
    if (this.game.input.activePointer.leftButton.isDown) {
      FireWeapon.call(this, currentWeaponId)
    }

    if ((GameConsts.DEBUG || window.DEBUG) && !polygonsHaveBeenDrawn) {
      // Render the polygons so that we can see them!
      for (var i in window.RS.groundPolygons.children) {
        var polygon = window.RS.groundPolygons.children[i]
        var graphics = this.game.add.graphics(polygon.body.sat.polygon.pos.x, polygon.body.sat.polygon.pos.y)
        graphics.beginFill(Phaser.Color.getRandomColor(100, 200))
        graphics.drawPolygon(polygon.body.sat.polygon.points)
        graphics.endFill()
        graphics.alpha = 0.5
      }
      polygonsHaveBeenDrawn = true
    }

    ReloadGunWhenEmpty.call(this, currentWeaponId)

    RotateBulletsToTrajectory.call(this)
    UpdateHurtBorder.call(this)
    UpdatePlayerPosition.call(this)
    UpdateEnemyPositions.call(this)
  },

  render () {
    if (!GameConsts.DEBUG && !window.DEBUG) return

    this.game.debug.text('FPS: ' + (this.time.fps || '--'), 32, 50, '#ffffff')
    this.game.debug.body(window.RS.player)
    this.game.debug.cameraInfo(this.camera, 32, 90)
    this.game.debug.inputInfo(32, 180)
    this.game.debug.bodyInfo(window.RS.player, 32, 280)

    window.RS.enemies.forEach(enemy => this.game.debug.body(enemy))
    window.RS.bullets.forEach(bullet => this.game.debug.body(bullet))
    window.RS.enemyBullets.forEach(bullet => this.game.debug.body(bullet))
  }
}

export default Deathmatch
