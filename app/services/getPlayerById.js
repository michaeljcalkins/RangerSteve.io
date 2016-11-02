'use strict'

const _ = require('lodash')

module.exports = function(roomId, id, rooms) {
    if (! _.has(rooms, `[${roomId}].players`))
        return false

    return rooms[roomId].players[id]
}
