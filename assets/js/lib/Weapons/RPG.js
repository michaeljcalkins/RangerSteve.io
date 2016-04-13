'use strict'

let Bullet = require('../Bullet')
let Guid = require('../Guid')

let AK47 = function (config) {
    Phaser.Group.call(this, config.game, config.game.world, 'AK-47', false, true, Phaser.Physics.ARCADE);

    //	Here we set-up our audio sprite
    this.fx = config.game.add.audio('RPG-sound')
    this.allowMultiple = true

    this.damage = 22
    this.nextFire = 0
    this.bulletSpeed = 2300
    this.fireRate = 160;

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

AK47.prototype.fire = function(player, socket, roomId, volume) {
    if (this.game.time.time < this.nextFire)
        return

    var x = player.x + 15;
    var y = player.y + 30;

    this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId)
    this.setAll('tracking', true)

    this.nextFire = this.game.time.time + this.fireRate
    this.fx.volume = .3 * volume
    this.fx.play()
}

module.exports = AK47


//
// ///////////////////////////////////////////////////////////////////
// //  RPG that visually track the direction they're heading in //
// ///////////////////////////////////////////////////////////////////
//
// Weapon.RPG = function (game) {
//
//     Phaser.Group.call(this, game, game.world, 'RPG', false, true, Phaser.Physics.ARCADE);
//
//     this.nextFire = 0;
//     this.bulletSpeed = 400;
//     this.fireRate = 250;
//
//     for (var i = 0; i < 32; i++)
//     {
//         this.add(new Bullet(game, 'bullet10'), true);
//     }
//
//     this.setAll('tracking', true)
//
//     return this;
//
// };
//
// Weapon.RPG.prototype = Object.create(Phaser.Group.prototype);
// Weapon.RPG.prototype.constructor = Weapon.RPG;
//
// Weapon.RPG.prototype.fire = function (source) {
//
//     if (this.game.time.time < this.nextFire) { return; }
//
//     var x = source.x + 10;
//     var y = source.y + 10;
//
//     this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, -700);
//     this.getFirstExists(false).fire(x, y, 0, this.bulletSpeed, 0, 700);
//
//     this.nextFire = this.game.time.time + this.fireRate;
//
// };
