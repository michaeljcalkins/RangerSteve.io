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

import setEventHandlers from '../lib/SocketEvents/setEventHandlers'
import GameConsts from '../lib/GameConsts'

/**
 * Load global assets and make socket connection.
 */
function Preloader(game) {
    this.game = game
}

Preloader.prototype = {

    preload: function() {
        console.log('Preloader')
        this.game.load.image('ground', '/images/platform.png')
        this.game.load.image('bullet', '/images/bullet.png')
        this.game.load.image('leftHudBg', '/images/leftHudBg.png')
        this.game.load.image('rightHudBg', '/images/rightHudBg.png')
        this.game.load.image('centerHudBg', '/images/centerHudBg.png')
        this.game.load.image('hudHealthIcon', '/images/icons/cross-24.png')
        this.game.load.image('hudAmmoIcon', '/images/icons/ammo-tin-24.png')
        this.game.load.image('hudGasIcon', '/images/icons/gas-24.png')
        this.game.load.image('left-arm', '/images/body/left-arm.png')
        this.game.load.image('player-placeholder', '/images/player-placeholder.png')

        this.game.load.spritesheet('hurt-border', '/images/hurt-border.png')
        this.game.load.spritesheet('jumpjet', '/images/jumpjet.png', 214, 418)
        this.game.load.spritesheet('blood', '/images/blood.png', 440, 256)
        this.game.load.spritesheet('player', '/sprites/player.png', 62, 62)
        this.game.load.spritesheet('right-arm-and-weapons', '/sprites/right-arm-and-weapons.png', 370, 80)

        this.game.load.atlas('rpgExplosion', '/sprites/rpgExplosion.png', '/sprites/rpgExplosion.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
        this.game.load.atlas('ricochet', '/sprites/ricochet.png', '/sprites/ricochet.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
        this.game.load.atlas('player-death', '/sprites/player-death.png', '/sprites/player-death.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)

        this.game.load.audio('jumpjet', '/audio/jumpjet.mp3')
        this.game.load.audio('switching-weapons', '/audio/switching-weapons.mp3')

        this.game.load.audio('AK47', '/audio/AK47.mp3')
        this.game.load.audio('M500', '/audio/M500.mp3')
        this.game.load.audio('Skorpion', '/audio/Skorpion.mp3')
        this.game.load.audio('P90', '/audio/P90.mp3')
        this.game.load.audio('M4A1', '/audio/M4A1.mp3')
        this.game.load.audio('Barrett', '/audio/BarrettM90.mp3')

        this.game.load.audio('DesertEagle', '/audio/DesertEagle.mp3')
        this.game.load.audio('RPG', '/audio/RPG.mp3')
        this.game.load.audio('RPG-explosion-sound', '/audio/RPGExplosion.mp3')

        this.game.load.audio('triplekill', '/audio/killingSpree/triplekill_ultimate.mp3')
        this.game.load.audio('multikill', '/audio/killingSpree/multikill_ultimate.mp3')
        this.game.load.audio('ultrakill', '/audio/killingSpree/ultrakill_ultimate.mp3')
        this.game.load.audio('killingspree', '/audio/killingSpree/killingspree_ultimate.mp3')
        this.game.load.audio('unstoppable', '/audio/killingSpree/unstoppable_ultimate.mp3')
        this.game.load.audio('ludicrouskill', '/audio/killingSpree/ludicrouskill_ultimate.mp3')
        this.game.load.audio('rampagekill', '/audio/killingSpree/rampage_ultimate.mp3')
        this.game.load.audio('monsterkill', '/audio/killingSpree/monsterkill_ultimate.mp3')
        this.game.load.audio('headshot', '/audio/headshot.mp3')
    },

    create: function() {
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
        this.enemies = this.game.add.group()
        this.enemies.enableBody = true
        this.enemies.physicsBodyType = Phaser.Physics.ARCADE
        this.game.physics.arcade.enable(this.enemies)
        this.game.physics.enable(this.enemies, Phaser.Physics.ARCADE)

        this.jumpjetFx = this.game.add.audio('jumpjet')
        this.switchingWeaponsFx = this.game.add.audio('switching-weapons')
        this.headshotSound = this.game.add.audio('headshot')

        this.enemyBullets = this.game.add.group()
        this.enemyBullets.enableBody = true
        this.enemyBullets.createMultiple(200, 'bullet')
        this.enemyBullets.setAll('checkWorldBounds', true)
        this.enemyBullets.setAll('outOfBoundsKill', true)
        this.game.physics.arcade.enable(this.enemyBullets)
        this.enemyBullets.forEach(function(bullet) {
            bullet.body.height = 15
            bullet.body.width = 15
            bullet.height = 2
            bullet.width = 40
        }, this)
        this.game.slopes.enable(this.enemyBullets)

        this.rpgExplosions = this.game.add.group()
        this.ricochets = this.game.add.group()
        this.bloodSprays = this.game.add.group()
        this.playerDeaths = this.game.add.group()
        this.bullets = this.game.add.group()

        window.socket = io.connect()
        setEventHandlers.call(this)
    }

}

export default Preloader