'use strict'

module.exports = function(id) {
    for (let i = 0; i < this.enemyBullets.length; i++) {
        if (this.enemyBullets[i].bullet.id === id) {
            return this.enemyBullets[i]
        }
    }

    return false
}
