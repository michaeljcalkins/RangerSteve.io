'use strict'

function playerById(id) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].id === id) {
            return this.players[i]
        }
    }

    return false
}

module.exports = { playerById }
