const _ = require('lodash')

const filterSpawnPointsBasedOnEnemyPositions = require('./filterSpawnPointsBasedOnEnemyPositions')

module.exports = function (spawnPoints, players) {
  const possibleSpawnPoints = filterSpawnPointsBasedOnEnemyPositions(spawnPoints, players)

  return possibleSpawnPoints.length > 0
    ? _.sample(possibleSpawnPoints)
    : _.sample(spawnPoints)
}
