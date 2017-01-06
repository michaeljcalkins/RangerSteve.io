import { assert } from 'chai'

import getTeam from './getTeam'

describe('getTeam', function() {
  it('should return red if there are no arguments', function() {
    assert.equal(getTeam(), 'red')
  })

  it('should return red if there are no players', function() {
    const players = []

    assert.equal(getTeam(players), 'red')
  })

  it('should return red if there are no players and red team is losing', function() {
    const players = []
    const redTeamScore = 0
    const blueTeamScore = 20

    assert.equal(getTeam(players, redTeamScore, blueTeamScore), 'red')
  })

  it('should return blue if there are no players and blue team is losing', function() {
    const players = []
    const redTeamScore = 20
    const blueTeamScore = 0

    assert.equal(getTeam(players, redTeamScore, blueTeamScore), 'blue')
  })

  it('should return blue if there are more red players', function() {
    const players = [
            { meta: { team: 'red' } },
            { meta: { team: 'red' } },
            { meta: { team: 'blue' } },
    ]

    assert.equal(getTeam(players), 'blue')
  })

  it('should return red if there are more blue players', function() {
    const players = [
            { meta: { team: 'blue' } },
    ]

    assert.equal(getTeam(players), 'red')
  })

  it('should return red if there are 2 players in blue team and no red players', function() {
    const players = [
            { meta: { team: 'blue' } },
            { meta: { team: 'blue' } },
    ]

    assert.equal(getTeam(players), 'red')
  })

  it('should return red if the number of red and blue players is the same and both teams have no points', function() {
    const players = [
            { meta: { team: 'red' } },
            { meta: { team: 'blue' } },
    ]

    assert.equal(getTeam(players), 'red')
  })

  it('should return red if the number of red and blue players is the same and it is a tie', function() {
    const players = [
            { meta: { team: 'red' } },
            { meta: { team: 'blue' } },
    ]
    const redTeamScore = 20
    const blueTeamScore = 20

    assert.equal(getTeam(players, redTeamScore, blueTeamScore), 'red')
  })

  it('should return blue if the number of red and blue players is the same and blue team is losing', function() {
    const players = [
            { meta: { team: 'red' } },
            { meta: { team: 'blue' } },
    ]
    const redTeamScore = 0
    const blueTeamScore = 20

    assert.equal(getTeam(players, redTeamScore, blueTeamScore), 'red')
  })

  it('should return blue if the number of red and blue players is the same and blue team is losing', function() {
    const players = [
            { meta: { team: 'red' } },
            { meta: { team: 'blue' } },
    ]
    const redTeamScore = 20
    const blueTeamScore = 0

    assert.equal(getTeam(players, redTeamScore, blueTeamScore), 'blue')
  })
})
