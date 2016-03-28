'use strict'

let Bullet = require('../Bullet')
let Guid = require('../Guid')

let Spas12 = function (config) {
    Phaser.Group.call(this, config.game, config.game.world, 'Spas-12', false, true, Phaser.Physics.ARCADE)

    this.nextFire = 0
    this.bulletSpeed = 1900
    this.fireRate = 500

    for (var i = 0; i < 32; i++)
    {
        let bullet = new Bullet(config.game, 'bullet12', config.socket)
        bullet.bulletId = Guid()
        bullet.height = 2
        bullet.width = 40
        bullet.damage = 22
        this.add(bullet, true)
    }

    return this
}

Spas12.prototype = Object.create(Phaser.Group.prototype)
Spas12.prototype.constructor = Spas12

Spas12.prototype.fire = function (player, socket, roomId) {
    if (this.game.time.time < this.nextFire)
        return





    var x = player.x + 15
    var y = player.y + 30



    var bulletInstance = this.getFirstExists(false)
    if (!bulletInstance) return
    bulletInstance.fire(x, y, .3, this.bulletSpeed, 0, 0, socket, roomId)




    bulletInstance = this.getFirstExists(false)
    if (!bulletInstance) return
    bulletInstance.fire(x, y, -0.3, this.bulletSpeed, 0, 0, socket, roomId)



    bulletInstance = this.getFirstExists(false)
    if (!bulletInstance) return
    bulletInstance.fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId)





    bulletInstance = this.getFirstExists(false)
    if (!bulletInstance) return
    bulletInstance.fire(x, y, 0, this.bulletSpeed, 0, 0, socket, roomId)




    this.setAll('tracking', true)

    this.nextFire = this.game.time.time + this.fireRate
}

module.exports = Spas12
