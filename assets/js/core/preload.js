import GameConsts from '../lib/GameConsts'

export default function Preload() {
    this.load.image('map-bg', '/images/high-rule-desert.png')
    this.load.image('ground', '/images/platform.png')
    this.load.image('bullet', '/images/bullet.png')

    this.load.spritesheet('muzzle-flash', '/images/muzzle-flash.png', 447, 271)
    this.load.spritesheet('commando', '/images/commando.png', 300, 315)
    this.load.spritesheet('ricochet', '/images/ricochet.png', 274, 185)

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

    this.load.audio('AK47-sound', '/audio/AK47.ogg')
    this.load.audio('M500-sound', '/audio/M500.ogg')
    this.load.audio('Skorpion-sound', '/audio/Skorpion.ogg')
    this.load.audio('AUG-sound', '/audio/AUG.ogg')
    this.load.audio('G43-sound', '/audio/G43.ogg')
    this.load.audio('P90-sound', '/audio/P90.ogg')
    this.load.audio('M4A1-sound', '/audio/M4A1.ogg')
    this.load.audio('BarretM90-sound', '/audio/BarretM90.ogg')

    this.load.audio('DesertEagle-sound', '/audio/DesertEagle.ogg')
    this.load.audio('RPG-sound', '/audio/RPG.ogg')
}
