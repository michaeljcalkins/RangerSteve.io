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

  it('should return a random spawn point away from the enemy in the top left position', function () {
    const players = {
      asdf: { x: 400, y: 300 }
    }

    const spawnPoint = getSpawnPoint(spawnPoints, players)

    assert.typeOf(spawnPoint, 'object')
    assert.isAbove(spawnPoint.x, 1)
    assert.isAbove(spawnPoint.y, 1)
  })

  it('should return a random spawn point away from the enemy in the bottom right position', function () {
    const players = {
      asdf: { x: 3500, y: 3500 }
    }

    const spawnPoint = getSpawnPoint(spawnPoints, players)

    assert.typeOf(spawnPoint, 'object')
    assert.isBelow(spawnPoint.x, 3000)
    assert.isBelow(spawnPoint.y, 3000)
  })

  it('should return a random spawn point when alone in room', function () {
    const players = {}

    const spawnPoint = getSpawnPoint(spawnPoints, players)

    assert.typeOf(spawnPoint, 'object')
    assert.typeOf(spawnPoint.x, 'number')
    assert.typeOf(spawnPoint.y, 'number')
    assert.include(spawnPoints, spawnPoint)
  })
})
