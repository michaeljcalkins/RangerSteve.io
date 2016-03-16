'use strict'

module.exports = function(data) {
    let removeBullet = BulletById.call(this, data.bulletId)

    // Player not found
    if (!removeBullet) {
        console.log('Player not found: ', data.id)
        return
    }

    removeBullet.bullet.kill()

    // Remove player from array
    this.enemyBullets.splice(this.enemyBullets.indexOf(removeBullet), 1)

    console.log('bullet removed')
}
