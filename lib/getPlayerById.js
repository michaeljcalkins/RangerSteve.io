const get = require('lodash/get')

module.exports = function (room, playerId) {
  return get(room, `players[${playerId}]`, false)
}
