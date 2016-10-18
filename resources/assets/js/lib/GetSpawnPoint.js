import GameConsts from './GameConsts'

export default function GetSpawnPoint(spawnPoints, enemies) {
    const possibleSpawnPoints = filterSpawnPointsBasedOnEnemyPositions(spawnPoints, enemies)

    return (possibleSpawnPoints.length) ? _.sample(possibleSpawnPoints) : _.sample(spawnPoints)
}

function filterSpawnPointsBasedOnEnemyPositions(spawnPoints, enemies) {
    const possibleSpawnPoints = [...spawnPoints]

    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i]

        for (let j = possibleSpawnPoints.length - 1; j >= 0; j--) {
            const possibleSpawnPoint = possibleSpawnPoints[j]
            const distanceBetweenEnemyAndSpawnPoint = Phaser.Math.distance(
                enemy.x, enemy.y,
                possibleSpawnPoint.x, possibleSpawnPoint.y
            )

            if (distanceBetweenEnemyAndSpawnPoint < GameConsts.SPAWN_POINT_DISTANCE_FROM_ENEMY) {
                possibleSpawnPoints.splice(j, 1)
            }
        }
    }

    return possibleSpawnPoints
}
