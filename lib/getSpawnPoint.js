const _ = require('lodash')

const GameConsts = require('./GameConsts')

function distanceBetweenTwoPoints (x1, y1, x2, y2) {
  var a = x1 - x2
  var b = y1 - y2

  return Math.sqrt(a * a + b * b)
}

function filterSpawnPointsBasedOnEnemyPositions (spawnPoints, players) {
  const possibleSpawnPoints = _.clone(spawnPoints)

  Object.keys(players).forEach(playerId => {
    const player = players[playerId]
    _.remove(possibleSpawnPoints, function (possibleSpawnPoint) {
      const distanceBetweenEnemyAndSpawnPoint = distanceBetweenTwoPoints(
        player.x, player.y,
        possibleSpawnPoint.x, possibleSpawnPoint.y
      )

      return distanceBetweenEnemyAndSpawnPoint < GameConsts.SPAWN_POINT_DISTANCE_FROM_ENEMY
    })
  })

  return possibleSpawnPoints
}

module.exports = function (spawnPoints, players, mustUsePossibleSpawnPoints = false) {
  const possibleSpawnPoints = filterSpawnPointsBasedOnEnemyPositions(spawnPoints, players)

  if (mustUsePossibleSpawnPoints) {
    /**
     * Mainly for testing to ensure we are not getting
     * random spawn points and are testing
     * the filter function.
     */
    return _.sample(possibleSpawnPoints)
  }

  return possibleSpawnPoints.length > 0
    ? _.sample(possibleSpawnPoints)
    : _.sample(spawnPoints)
}
