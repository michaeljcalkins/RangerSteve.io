'use strict'

const Player = function(id, startX, startY) {
    return {
        x: startX,
        y: startY,
        id: id
    }
}

module.exports = Player
