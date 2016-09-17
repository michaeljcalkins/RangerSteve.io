import GameConsts from '../lib/GameConsts'

export default function Preload() {
    // Map
    this.load.image('ground', '/images/platform.png')
    this.load.image('bullet', '/images/bullet.png')
    this.load.image('leftHudBg', '/images/leftHudBg.png', true)
    this.load.image('rightHudBg', '/images/rightHudBg.png', true)

    this.load.spritesheet('hurt-border', '/images/hurt-border.png')
    this.load.spritesheet('muzzle-flash', '/images/muzzle-flash.png', 447, 271)
    this.load.spritesheet('jumpjet', '/images/jumpjet.png', 214, 418)
    this.load.spritesheet('commando', '/images/commando.png', 300, 315)
    this.load.spritesheet('ricochet', '/images/ricochet.png', 274, 185)
    this.load.spritesheet('blood', '/images/blood.png', 440, 256)
    this.load.spritesheet('rocket', '/images/air-explosion.png', 904, 598, 15)

    // Weapons
    Object.keys(GameConsts.WEAPONS).forEach((weaponId) => {
        this.load.image(weaponId, '/images/guns/' + GameConsts.WEAPONS[weaponId].image)
    })

    this.load.image('right-arm', '/images/body/right-arm.png')
    this.load.image('left-arm', '/images/body/left-arm.png')
    this.load.image('head', '/images/body/head.png')
    this.load.image('torso', '/images/body/torso.png')

    this.load.audio('jumpjet', '/audio/jumpjet.mp3')

    this.load.audio('AK47', '/audio/AK47.mp3')
    this.load.audio('M500', '/audio/M500.mp3')
    this.load.audio('Skorpion', '/audio/Skorpion.mp3')
    this.load.audio('AUG', '/audio/AUG.mp3')
    this.load.audio('G43', '/audio/G43.mp3')
    this.load.audio('P90', '/audio/P90.mp3')
    this.load.audio('M4A1', '/audio/M4A1.mp3')
    this.load.audio('Barrett', '/audio/BarrettM90.mp3')

    this.load.audio('DesertEagle', '/audio/DesertEagle.mp3')
    this.load.audio('SilverBaller', '/audio/SilverBaller.mp3')
    this.load.audio('RPG', '/audio/RPG.mp3')
    this.load.audio('RPG-explosion-sound', '/audio/RPGExplosion.mp3')

    this.load.audio('triplekill', '/audio/killingSpree/triplekill_ultimate.mp3')
    this.load.audio('multikill', '/audio/killingSpree/multikill_ultimate.mp3')
    this.load.audio('ultrakill', '/audio/killingSpree/ultrakill_ultimate.mp3')
    this.load.audio('killingspree', '/audio/killingSpree/killingspree_ultimate.mp3')
    this.load.audio('unstoppable', '/audio/killingSpree/unstoppable_ultimate.mp3')
    this.load.audio('ludicrouskill', '/audio/killingSpree/ludicrouskill_ultimate.mp3')
    this.load.audio('rampagekill', '/audio/killingSpree/rampage_ultimate.mp3')
    this.load.audio('monsterkill', '/audio/killingSpree/monsterkill_ultimate.mp3')
}
