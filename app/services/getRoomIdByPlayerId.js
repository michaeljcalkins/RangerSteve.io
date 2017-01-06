'use strict'

module.exports = function(playerId, rooms) {
  if (! playerId || ! rooms) return false

  let selectedRoomId = false
  Object.keys(rooms).forEach(roomId => {
    if (rooms[roomId].players[playerId]) {
      selectedRoomId = roomId
    }
  })

  return selectedRoomId
}
