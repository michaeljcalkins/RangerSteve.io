import GameConsts from '../lib/GameConsts'

export default function Preload(store) {
    // Map
    this.load.image('ground', '/images/platform.png')
    this.load.image('bullet', '/images/bullet.png')
    this.load.spritesheet('hurt-border', '/images/hurt-border.png')

    this.load.spritesheet('muzzle-flash', '/images/muzzle-flash.png', 447, 271)
    this.load.spritesheet('commando', '/images/commando.png', 300, 315)
    this.load.spritesheet('ricochet', '/images/ricochet.png', 274, 185)
    this.load.spritesheet('blood', '/images/blood.png', 440, 256)
    this.load.spritesheet('rocket', '/images/air-explosion.png', 904, 598, 15)

    // Weapons
    GameConsts.PRIMARY_WEAPONS.forEach((weapon) => {
        this.load.image(weapon.id, weapon.image)
    })

    GameConsts.SECONDARY_WEAPONS.forEach((weapon) => {
        this.load.image(weapon.id, weapon.image)
    })

    this.load.image('right-arm', '/images/body/right-arm.png')
    this.load.image('left-arm', '/images/body/left-arm.png')
    this.load.image('head', '/images/body/head.png')
    this.load.image('torso', '/images/body/torso.png')

    this.load.audio('AK47-sound', '/audio/AK47.mp3')
    this.load.audio('M500-sound', '/audio/M500.mp3')
    this.load.audio('Skorpion-sound', '/audio/Skorpion.mp3')
    this.load.audio('AUG-sound', '/audio/AUG.mp3')
    this.load.audio('G43-sound', '/audio/G43.mp3')
    this.load.audio('P90-sound', '/audio/P90.mp3')
    this.load.audio('M4A1-sound', '/audio/M4A1.mp3')
    this.load.audio('BarretM90-sound', '/audio/BarretM90.mp3')

    this.load.audio('DesertEagle-sound', '/audio/DesertEagle.mp3')
    this.load.audio('SilverBaller-sound', '/audio/SilverBaller.mp3')
    this.load.audio('RPG-sound', '/audio/RPG.mp3')
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
