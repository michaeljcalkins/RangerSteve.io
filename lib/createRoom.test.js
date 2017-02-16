import { assert } from 'chai'

import createRoom from './createRoom'

describe('createRoom', function () {
  it('should create room with cleaned custom room id and player', function () {
    const newRoom = createRoom({
      id: 'test.test/@#$asdf-',
      player: { id: 123 }
    })

    assert.equal(newRoom.id, 'testtestasdf-')
    assert.equal(newRoom.players[123].id, 123)
  })

  it('should create room with a shortened custom room id', function () {
    const newRoom = createRoom({
      id: 'test.test/@#$asdf-asdfadsflhgaweurghalw3ur23jghatkwjfuwajkgjku3gjgb4k3ygtkajsgdfkjasgdfkagw'
    })

    assert.equal(newRoom.id.length, 25)
    assert.equal(newRoom.id, 'testtestasdf-asdfadsflhga')
  })

  it('should create room with random room id and player', function () {
    const newRoom = createRoom({
      player: { id: 123 }
    })

    assert.isString(newRoom.id)
    assert.equal(newRoom.players[123].id, 123)
  })

  it('should create room with random room id, specified map, gamemode, and player', function () {
    const newRoom = createRoom({
      player: { id: 123 },
      map: 'HighRuleJungle',
      gamemode: 'Deathmatch'
    })

    assert.isString(newRoom.id)
    assert.equal(newRoom.players[123].id, 123)
    assert.equal(newRoom.map, 'HighRuleJungle')
    assert.equal(newRoom.gamemode, 'Deathmatch')
  })

  it('should create room with random room id and player with incorrect map and gamemode', function () {
    const newRoom = createRoom({
      player: { id: 123 },
      map: 'HighRuleJungles',
      gamemode: 'TeamDeathmatchs'
    })

    assert.isString(newRoom.id)
    assert.equal(newRoom.players[123].id, 123)
    assert.notEqual(newRoom.map, 'HighRuleJungles')
    assert.notEqual(newRoom.gamemode, 'TeamDeathmatchs')
  })

  it('should create room with random room id and player', function () {
    const newRoom = createRoom({
      players: {
        123: { id: 123 },
        223: { id: 223 }
      }
    })

    assert.isString(newRoom.id)
    assert.equal(newRoom.players[123].id, 123)
    assert.equal(newRoom.players[223].id, 223)
  })
})
