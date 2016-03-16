'use strict'

let Bullet = require('../Bullet')

module.exports = function(data) {
    if (data.id === ('/#' + this.socket.id))
        return

    let newEnemyBullet = this.enemyBullets.create(data.x, data.y, 'bullet12')
    newEnemyBullet.rotation = data.pointerAngle
    newEnemyBullet.height = data.height
    newEnemyBullet.width = data.width

    console.log('Bullet fired by', data.id)
}
