/**
 * Load all base game assets and start the gamemode.
 */
import GameConsts from '../lib/GameConsts'

function Preloader(game) {
    this.game = game
}

Preloader.prototype = {

    preload: function() {
        this.load.image('ranger-steve', '/images/ranger-steve.png')
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
        const state = this.game.store.getState()

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
        RS.enemies = this.game.add.group()
        RS.enemies.enableBody = true
        RS.enemies.physicsBodyType = Phaser.Physics.ARCADE
        this.game.physics.arcade.enable(RS.enemies)
        this.game.physics.enable(RS.enemies, Phaser.Physics.ARCADE)

        RS.jumpjetFx = this.game.add.audio('jumpjet')
        RS.switchingWeaponsFx = this.game.add.audio('switching-weapons')
        RS.headshotSound = this.game.add.audio('headshot')

        this.stage.backgroundColor = '#2B2825'

        this.rangerSteveSprite = this.add.sprite(this.world.centerX, this.world.centerY, 'ranger-steve')
        this.rangerSteveSprite.anchor.setTo(0.5)

        const style = {
            font: "35px Bangers",
            fill: "#fff",
        }
        let text = this.game.add.text(this.rangerSteveSprite.x - 20, this.rangerSteveSprite.y + 110, 'Loading...', style)
        text.anchor.set(0.5)
        text.smoothed = true

        this.game.state.start(state.room.gamemode)
    },

}

export default Preloader