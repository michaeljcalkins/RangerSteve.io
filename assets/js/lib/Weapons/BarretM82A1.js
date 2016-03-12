'use strict'

let Bullet = require('../Bullet')

let barretM82A1.js = function (game) {
    Phaser.Group.call(this, game, game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    this.damage = 22
    this.nextFire = 0
    this.bulletSpeed = 1500

    // barretM82A1.js fires about 600 bullets per second
    this.fireRate = 4000

    for (var i = 0; i < 64; i++)
    {
        let bullet = new Bullet(this.game, 'ground')
        bullet.height = 3
        bullet.width = 10
        bullet.damage = 22

        this.add(bullet, true)
    }

    return this
}

barretM82A1.js.prototype = Object.create(Phaser.Group.prototype);
barretM82A1.js.prototype.constructor = barretM82A1.js;

barretM82A1.js.prototype.fire = function (source) {
    if (this.game.time.time < this.nextFire)
        return

    var x = source.x + 15;
    var y = source.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0)
    this.setAll('tracking', true)

    this.nextFire = this.game.time.time + this.fireRate
}

module.exports = barretM82A1.js
