'use strict'

const _ = require('lodash')

module.exports = function(roomId, id, rooms) {
  if (! roomId || ! id || ! rooms) return false

  if (! _.has(rooms, `['${roomId}'].players`))
    return false

  return rooms[roomId].players[id]
}
