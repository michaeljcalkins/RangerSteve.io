'use strict'

let _ = require('lodash')

let PlayerById = function(roomId, id, rooms) {
    if (! _.has(rooms, `[${roomId}].players`))
        return false

    return rooms[roomId].players[id]
}

module.exports = PlayerById
