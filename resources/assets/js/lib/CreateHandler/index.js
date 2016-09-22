import GameConsts from '../GameConsts'
import CreateEvents from './CreateEvents'
import CreateHurtBorder from './CreateHurtBorder'
import CreateMapAndPlayer from './CreateMapAndPlayer'
import CreateBullets from './CreateBullets'
import CreateMusic from './CreateMusic'
import CreateDetectIdleUser from './CreateDetectIdleUser'
import CreateKillingSpreeAudio from './CreateKillingSpreeAudio'
import CreateUI from './CreateUI'
import actions from '../../actions'

export default function() {
    const store = this.game.store

    // Scale game on window resize
    this.game.scale.scaleMode = Phaser.ScaleManager.RESIZE
    this.game.scale.refresh()

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
    CreateMusic.call(this)
    CreateKillingSpreeAudio.call(this)
    CreateDetectIdleUser()
    CreateBullets.call(this)
    CreateUI.call(this)

    window.addEventListener('resize', () => {
        this.hurtBorderSprite.width = window.innerWidth
        this.hurtBorderSprite.height = window.innerHeight
    })

    store.dispatch(actions.game.setState('active'))
}
