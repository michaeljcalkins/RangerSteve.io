const values = require('lodash/values')

module.exports = function getSortedPlayers(players) {
  if (values(players).length <= 0) return []

  return values(players).sort((a, b) => {
    const scoreA = a.score || 0
    const scoreB = b.score || 0

    const secondsInRoundA = a.secondsInRound || Infinity
    const secondsInRoundB = b.secondsInRound || Infinity

    return scoreA < scoreB || scoreA === scoreB && secondsInRoundA > secondsInRoundB
  })
}
