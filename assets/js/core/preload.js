'use strict'

module.exports = function() {
    this.load.image('treescape', '/images/map-ctf1.png')
    this.load.image('ground', '/images/platform.png')
    this.load.image('bullet12', '/images/bullet12.png')

    this.load.spritesheet('dude', '/images/dude.png', 32, 48)
    this.load.spritesheet('enemy', '/images/dude.png', 32, 48)

    this.load.audio('AK47-sound', '/audio/AK47.ogg')
    this.load.audio('BarretM90-sound', '/audio/BarretM90.ogg')
    this.load.audio('M249-sound', '/audio/M249.ogg')
    this.load.audio('MP5-sound', '/audio/MP5.ogg')
    this.load.audio('DesertEagle-sound', '/audio/DesertEagle.ogg')
    this.load.audio('M4A1-sound', '/audio/M4A1.ogg')
}
