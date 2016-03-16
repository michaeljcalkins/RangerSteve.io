'use strict'

let Bullet = function(startX, startY, bulletId) {
    let bulletObj = {
        x: startX,
        y: startY,
        bulletId: bulletId
    }

    return bulletObj
}

module.exports = Bullet
