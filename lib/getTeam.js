'use strict'

const _ = require('lodash')

const getTeam = function (players, redTeamScore, blueTeamScore) {
  if (players === undefined) players = []
  if (redTeamScore === undefined) redTeamScore = 0
  if (blueTeamScore === undefined) blueTeamScore = 0

  const playersByTeamCount = _.countBy(players, 'team')
  const redPlayerCount = _.get(playersByTeamCount, 'red', 0)
  const bluePlayerCount = _.get(playersByTeamCount, 'blue', 0)

  if (
    redPlayerCount > bluePlayerCount ||
    (redPlayerCount === bluePlayerCount && redTeamScore > blueTeamScore)
  ) {
    return 'blue'
  }

  return 'red'
}

module.exports = getTeam
