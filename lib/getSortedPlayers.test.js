import { assert } from 'chai'

import getSortedPlayers from './getSortedPlayers'

describe('getSortedPlayers', function () {
  it('should return an empty array if there is no data', function () {
    const players = {}

    assert.deepEqual(getSortedPlayers(players), [])
  })

  it('should return an array sorted by descending score', function () {
    const noob = { 'nickname': 'Noob', 'score': 0 }
    const master = { 'nickname': 'Master', 'score': 50 }

    const players = {
      'noobId': noob,
      'masterId': master
    }
    const sortedPlayers = [master, noob]

    assert.deepEqual(getSortedPlayers(players), sortedPlayers)
  })

  it('should return an array sorted by ascending in-game time if there are many players with the same score', function () {
    const noob = { 'nickname': 'Noob', 'score': 10, 'secondsInRound': 10 }
    const noob2 = { 'nickname': 'Noob2', 'score': 10 }
    const master = { 'nickname': 'Master', 'score': 10, 'secondsInRound': 5 }

    const players = {
      'noobId': noob,
      'noob2Id': noob2,
      'masterId': master
    }
    const sortedPlayers = [master, noob, noob2]

    assert.deepEqual(getSortedPlayers(players), sortedPlayers)
  })

  it('should return an array sorted by descending score and ascending in-game time if some players has missing data', function () {
    const noob = { 'nickname': 'Noob', 'score': 10 }
    const noob2 = { 'nickname': 'Noob2', 'secondsInRound': 2 }
    const noob3 = { 'nickname': 'Noob3' }
    const master = { 'nickname': 'Master', 'score': 20, 'secondsInRound': 5 }
    const master2 = { 'nickname': 'Master2', 'score': 50 }

    const players = {
      'noobId': noob,
      'noob2Id': noob2,
      'noob3Id': noob3,
      'masterId': master,
      'master2Id': master2,
    }
    const sortedPlayers = [master2, master, noob, noob2, noob3]

    assert.deepEqual(getSortedPlayers(players), sortedPlayers)
  })
})
