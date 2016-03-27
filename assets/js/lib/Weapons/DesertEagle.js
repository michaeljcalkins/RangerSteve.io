'use strict'

let Bullet = require('../Bullet')
let Guid = require('../Guid')

let AK47 = function (config) {
    Phaser.Group.call(this, config.game, config.game.world, 'Desert Eagle', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('DesertEagle-sound')
    this.allowMultiple = true

    this.damage = 33
    this.nextFire = 0
    this.bulletSpeed = 2300
    this.fireRate = 267;

    for (var i = 0; i < 64; i++)
    {
        let bullet = new Bullet(config.game, 'bullet12', config.socket)
        bullet.bulletId = Guid()
        bullet.height = 2
        bullet.width = 40
        bullet.damage = 22
        this.add(bullet, true);
    }

    return this
}

AK47.prototype = Object.create(Phaser.Group.prototype);
AK47.prototype.constructor = AK47;

AK47.prototype.fire = function(player, socket, roomId) {
    if (this.game.time.time < this.nextFire)
        return

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId)
    this.setAll('tracking', true)

    this.nextFire = this.game.time.time + this.fireRate
    this.fx.volume = .3
    this.fx.play()
}

module.exports = AK47
