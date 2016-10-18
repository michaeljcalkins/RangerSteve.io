import GameConsts from './GameConsts'

export default function GetSpawnPoint(spawnPoints, enemies) {
    const possibleSpawnPoints = filterSpawnPointsBasedOnEnemyPositions(spawnPoints, enemies)

    return (possibleSpawnPoints.length) ? _.sample(possibleSpawnPoints) : _.sample(spawnPoints)
}

function filterSpawnPointsBasedOnEnemyPositions(spawnPoints, enemies) {
    const possibleSpawnPoints = [...spawnPoints]

    enemies.forEach((enemy) => {
        _.remove(possibleSpawnPoints, (possibleSpawnPoint) => {
            const distanceBetweenEnemyAndSpawnPoint = Phaser.Math.distance(
                enemy.x, enemy.y,
                possibleSpawnPoint.x, possibleSpawnPoint.y
            )

            return distanceBetweenEnemyAndSpawnPoint < GameConsts.SPAWN_POINT_DISTANCE_FROM_ENEMY
        })
    })

    return possibleSpawnPoints
}
