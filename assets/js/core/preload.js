'use strict'

module.exports = function() {
    this.game.load.tilemap('level1', '/javascripts/HighruleTemple.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('1', '/images/Tiles/1.png')
    this.game.load.image('2', '/images/Tiles/2.png')
    this.game.load.image('3', '/images/Tiles/3.png')
    this.game.load.image('4', '/images/Tiles/4.png')
    this.game.load.image('5', '/images/Tiles/5.png')
    this.game.load.image('6', '/images/Tiles/6.png')
    this.game.load.image('7', '/images/Tiles/7.png')
    this.game.load.image('8', '/images/Tiles/8.png')
    this.game.load.image('9', '/images/Tiles/9.png')
    this.game.load.image('10', '/images/Tiles/10.png')
    this.game.load.image('11', '/images/Tiles/11.png')
    this.game.load.image('12', '/images/Tiles/12.png')
    this.game.load.image('13', '/images/Tiles/13.png')
    this.game.load.image('14', '/images/Tiles/14.png')
    this.game.load.image('15', '/images/Tiles/15.png')
    this.game.load.image('16', '/images/Tiles/16.png')
    this.game.load.image('17', '/images/Tiles/17.png')
    this.game.load.image('18', '/images/Tiles/18.png')
    this.game.load.image('BG', '/images/BG/BG.png')

    this.load.image('treescape', '/images/map-ctf1.png')
    this.load.image('ground', '/images/platform.png')
    this.load.image('bullet12', '/images/bullet12.png')

    this.load.spritesheet('dude', '/images/dude.png', 32, 48)
    this.load.spritesheet('enemy', '/images/dude.png', 32, 48)

    this.load.audio('AK47-sound', '/audio/AK47.ogg')
    this.load.audio('BarretM82A1-sound', '/audio/BarretM82A1.ogg')
}
