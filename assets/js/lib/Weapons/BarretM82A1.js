'use strict'

let Bullet = require('../Bullet')
let Guid = require('../Guid')

let BarretM82A1 = function (config) {
    Phaser.Group.call(this, config.game, config.game.world, 'Barret M82A1', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('BarretM82A1-sound')
    this.allowMultiple = true

    this.name = 'Barret M82A1'
    this.damage = 88
    this.nextFire = 0
    this.bulletSpeed = 3435

    // BarretM82A1 fires about 600 bullets per second
    this.fireRate = 3000

    for (var i = 0; i < 64; i++)
    {
        let bullet = new Bullet(config.game, 'bullet12', config.socket)
        bullet.bulletId = Guid()
        bullet.height = 2
        bullet.width = 40
        bullet.damage = 88

        this.add(bullet, true)
    }

    return this
}

BarretM82A1.prototype = Object.create(Phaser.Group.prototype);
BarretM82A1.prototype.constructor = BarretM82A1;

BarretM82A1.prototype.fire = function (player, socket) {
    if (this.game.time.time < this.nextFire)
        return

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket)
    this.setAll('tracking', true)

    this.nextFire = this.game.time.time + this.fireRate
    this.fx.volume = .6
    this.fx.play()
}

module.exports = BarretM82A1
