import primaryWeapons from '../ui/components/Settings/PrimaryWeapons'
import secondaryWeapons from '../ui/components/Settings/SecondaryWeapons'

module.exports = function() {
    this.load.image('map-bg', '/images/high-rule-desert.png')
    this.load.image('ground', '/images/platform.png')
    this.load.image('bullet12', '/images/bullet.png')

    this.load.spritesheet('dude', '/images/dude.png', 32, 48)
    this.load.spritesheet('commando', '/images/commando.png', 300, 315)
    this.load.spritesheet('enemy', '/images/dude.png', 32, 48)

    // Weapons
    primaryWeapons.forEach((weapon) => {
        this.load.image(weapon.id, weapon.image)
    })

    secondaryWeapons.forEach((weapon) => {
        this.load.image(weapon.id, weapon.image)
    })

    this.load.image('right-arm', '/images/body/right-arm.png')
    this.load.image('left-arm', '/images/body/left-arm.png')
    this.load.image('head', '/images/body/head.png')
    this.load.image('torso', '/images/body/torso.png')

    this.load.audio('AK47-sound', '/audio/AK47.ogg')
    this.load.audio('BarretM90-sound', '/audio/BarretM90.ogg')
    this.load.audio('M249-sound', '/audio/M249.ogg')
    this.load.audio('MP5-sound', '/audio/MP5.ogg')
    this.load.audio('DesertEagle-sound', '/audio/DesertEagle.ogg')
    this.load.audio('M4A1-sound', '/audio/M4A1.ogg')
}
