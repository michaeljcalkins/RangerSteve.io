'use strict'

let Bullet = require('../Bullet')

let BarretM82A1 = function (game) {
    Phaser.Group.call(this, game, game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    this.name = 'Barret M82A1'
    this.damage = 88
    this.nextFire = 0
    this.bulletSpeed = 3435

    // BarretM82A1 fires about 600 bullets per second
    this.fireRate = 4000

    for (var i = 0; i < 64; i++)
    {
        let bullet = new Bullet(this.game, 'ground')
        bullet.height = 2
        bullet.width = 10
        bullet.damage = 88

        this.add(bullet, true)
    }

    return this
}

BarretM82A1.prototype = Object.create(Phaser.Group.prototype);
BarretM82A1.prototype.constructor = BarretM82A1;

BarretM82A1.prototype.fire = function (source) {
    if (this.game.time.time < this.nextFire)
        return

    var x = source.x + 15;
    var y = source.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0)
    this.setAll('tracking', true)

    this.nextFire = this.game.time.time + this.fireRate
}

module.exports = BarretM82A1
