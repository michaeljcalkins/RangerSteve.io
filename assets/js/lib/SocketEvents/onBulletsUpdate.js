'use strict'

let RemoteBullet = require('../RemoteBullet')

module.exports = function(data) {
    this.enemyBullets.forEach(function (enemyBullet) {
        enemyBullet.bullet.kill()
    })

    this.enemyBullets = []

    data.bullets.forEach((enemyBullet) => {
        let newRemoteBullet = RemoteBullet.call(this, enemyBullet)
        this.enemyBullets.push(newRemoteBullet)

        console.log('someone fired!', data)
    })
}
