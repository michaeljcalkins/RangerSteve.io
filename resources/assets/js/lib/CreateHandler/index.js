import GameConsts from '../GameConsts'
import CreateKeyboardBindings from './CreateKeyboardBindings'
import CreateHurtBorder from './CreateHurtBorder'
import CreateMapAndPlayer from './CreateMapAndPlayer'
import CreateBullets from './CreateBullets'
import CreateDetectIdleUser from './CreateDetectIdleUser'
import CreateKillingSpreeAudio from './CreateKillingSpreeAudio'
import CreateUI from './CreateUI'

export default function() {
    // Scale game on window resize
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE
    this.game.renderer.renderSession.roundPixels = true
    this.game.stage.disableVisibilityChange = true
    this.game.scale.refresh()

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
    CreateKeyboardBindings.call(this)
    CreateHurtBorder.call(this)
    CreateKillingSpreeAudio.call(this)
    CreateDetectIdleUser()
    CreateBullets.call(this)
    CreateUI.call(this)
}
