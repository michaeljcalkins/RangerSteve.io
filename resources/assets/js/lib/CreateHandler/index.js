import GameConsts from '../GameConsts'
import CreateEvents from './CreateEvents'
import CreateHurtBorder from './CreateHurtBorder'
import CreateMapAndPlayer from './CreateMapAndPlayer'
import CreateWindowEvents from './CreateWindowEvents'
import CreateBullets from './CreateBullets'
import CreateMusic from './CreateMusic'
import CreateDetectIdleUser from './CreateDetectIdleUser'
import CreateKillingSpreeAudio from './CreateKillingSpreeAudio'
import actions from '../../actions'

export default function() {
    const store = this.game.store

    // Scale game on window resize
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE
    this.game.scale.setShowAll()
    this.game.scale.refresh()

    // Feature configuration values that we'll use to control our game state
    this.features = {
        acceleration: 2000,
        gravity: 1000,
        enableGravity: true,
        dragX: 1200,
        dragY: 0,
        bounceX: 0,
        bounceY: 0,
        frictionX: 0,
        frictionY: 0,
        jump: 500,
        minimumOffsetY: 1,
        pullUp: 0,
        pullDown: 0,
        pullLeft: 0,
        pullRight: 0,
        snapUp: 0,
        snapDown: 0,
        snapLeft: 0,
        snapRight: 0,
        debug: 0
    };

    // Enables advanced profiling features when debugging
    this.time.advancedTiming = true

    // Start up Arcade Physics
    this.physics.startSystem(Phaser.Physics.ARCADE)
    this.game.plugins.add(Phaser.Plugin.ArcadeSlopes)
    this.physics.arcade.gravity.y = GameConsts.GRAVITY

    // Enemy remote players
    this.enemies = this.game.add.group()
    this.enemies.enableBody = true
    this.enemies.physicsBodyType = Phaser.Physics.ARCADE
    this.physics.arcade.enable(this.enemies)
    this.game.physics.enable(this.enemies, Phaser.Physics.ARCADE)

    CreateMapAndPlayer.call(this)
    CreateEvents.call(this)
    CreateHurtBorder.call(this)
    CreateWindowEvents.call(this)
    CreateMusic.call(this)
    CreateKillingSpreeAudio.call(this)
    CreateDetectIdleUser()
    CreateBullets.call(this)

    store.dispatch(actions.game.setState('active'))
}
