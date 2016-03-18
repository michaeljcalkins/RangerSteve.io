'use strict'

module.exports = function() {
    this.load.image('treescape', '/images/map-ctf1.png')
    this.load.image('ground', '/images/platform.png')
    this.load.image('bullet12', '/images/bullet12.png')

    this.load.spritesheet('dude', '/images/dude.png', 32, 48)
    this.load.spritesheet('enemy', '/images/dude.png', 32, 48)

    this.load.audio('AK47-sound', '/audio/AK47.ogg')
    this.load.audio('BarretM82A1-sound', '/audio/BarretM82A1.ogg')
}
