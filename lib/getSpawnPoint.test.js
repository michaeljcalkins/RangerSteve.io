import { assert } from 'chai'

import getSpawnPoint from './getSpawnPoint'

describe('getSpawnPoint', function () {
  const spawnPoints = [
    {x: 1, y: 1},
    {x: 1000, y: 1000},
    {x: 2000, y: 2000},
    {x: 3000, y: 3000},
    {x: 4000, y: 4000}
  ]

  it('should return a random spawn point further away than the SPAWN_POINT_DISTANCE_FROM_ENEMY', function () {
    let players = {
      asdf: { x: 400, y: 300 }
    }
    let spawnPoint = getSpawnPoint(spawnPoints, players, true)
    assert.typeOf(spawnPoint, 'object')
    assert.isAbove(spawnPoint.x, 1)
    assert.isAbove(spawnPoint.y, 1)

    players = {
      asdf: { x: 3500, y: 3500 }
    }
    spawnPoint = getSpawnPoint(spawnPoints, players, true)
    assert.typeOf(spawnPoint, 'object')
    assert.isBelow(spawnPoint.x, 3000)
    assert.isBelow(spawnPoint.y, 3000)
  })

  it('should return a random spawn point when alone in room', function () {
    let players = {}
    let spawnPoint = getSpawnPoint(spawnPoints, players, true)
    assert.typeOf(spawnPoint.x, 'number')
    assert.typeOf(spawnPoint.y, 'number')
  })
})
