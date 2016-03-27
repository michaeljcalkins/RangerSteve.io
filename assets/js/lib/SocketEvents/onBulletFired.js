'use strict'

let Bullet = require('../Bullet')

module.exports = function(data) {
    if (data.id === ('/#' + this.socket.id))
        return

    console.log('Firing bullet remotely', data.bulletId)

    let newEnemyBullet = this.enemyBullets.create(data.x, data.y, 'bullet12')
    newEnemyBullet.bulletId = data.bulletId
    newEnemyBullet.playerId = data.playerId
    newEnemyBullet.rotation = data.pointerAngle
    newEnemyBullet.height = data.height
    newEnemyBullet.width = data.width
    this.game.physics.enable(newEnemyBullet, Phaser.Physics.ARCADE)
    newEnemyBullet.body.gravity.y = -1800

    let newVelocity = this.game.physics.arcade.velocityFromRotation(data.pointerAngle, data.speed)
    newEnemyBullet.body.velocity.x += newVelocity.x
    newEnemyBullet.body.velocity.y += newVelocity.y
}
