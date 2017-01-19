import sample from 'lodash/sample'
import remove from 'lodash/remove'

import GameConsts from 'lib/GameConsts'

export default function GetSpawnPoint (spawnPoints, enemies) {
  const possibleSpawnPoints = filterSpawnPointsBasedOnEnemyPositions(spawnPoints, enemies)

  return (possibleSpawnPoints.length) ? sample(possibleSpawnPoints) : sample(spawnPoints)
}

function filterSpawnPointsBasedOnEnemyPositions (spawnPoints, enemies) {
  const possibleSpawnPoints = [...spawnPoints]

  enemies.forEach(enemy => {
    remove(possibleSpawnPoints, (possibleSpawnPoint) => {
      const distanceBetweenEnemyAndSpawnPoint = window.Phaser.Math.distance(
                enemy.x, enemy.y,
                possibleSpawnPoint.x, possibleSpawnPoint.y
            )

      return distanceBetweenEnemyAndSpawnPoint < GameConsts.SPAWN_POINT_DISTANCE_FROM_ENEMY
    })
  })

  return possibleSpawnPoints
}
