import { assert } from 'chai'

import filterSpawnPointsBasedOnEnemyPositions from './filterSpawnPointsBasedOnEnemyPositions'

describe('filterSpawnPointsBasedOnEnemyPositions', function () {
  it('should return an array of possible spawn points', function () {
    const spawnPoints = [
      { x: 1140, y: 2190 },
      { x: 1615, y: 1735 },
      { x: 2070, y: 2185 },
      { x: 770, y: 1515 },
      { x: 1697, y: 1263 },
      { x: 1535, y: 1260 },
      { x: 460, y: 1610 },
      { x: 140, y: 1320 },
      { x: 795, y: 1325 },
      { x: 440, y: 330 },
      { x: 65, y: 620 },
      { x: 2440, y: 1520 },
      { x: 2420, y: 1325 },
      { x: 2765, y: 1615 },
      { x: 3085, y: 1315 },
      { x: 2760, y: 335 },
      { x: 3040, y: 900 },
      { x: 1590, y: 490 },
      { x: 3155, y: 620 },
      { x: 1624, y: 913 },
      { x: 154, y: 908 },
      { x: 2562, y: 715 },
      { x: 666, y: 716 }
    ]

    const players = {
      LdYKA5f: {
        bestKillingSpree: 0,
        bulletsFired: 0,
        bulletsHit: 0,
        damageInflicted: 0,
        deaths: 0,
        headshots: 0,
        health: 100,
        id: 'LdYKA5f',
        killingSpree: 0,
        kills: 0,
        nickname: 'Bitter Creek Luke',
        score: 0,
        secondsInRound: 0,
        team: 'blue',
        timesHit: 0,
        weaponId: 'M500',
        x: 0,
        y: 0,
        uid: null
      }
    }

    const possibleSpawnPoints = filterSpawnPointsBasedOnEnemyPositions(spawnPoints, players)
    assert.isArray(possibleSpawnPoints)
  })
})
