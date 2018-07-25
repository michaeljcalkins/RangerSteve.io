module.exports = function getSortedPlayers (players) {
  const playersArray = Object.keys(players).map(function (index) {
    return players[index]
  })

  if (playersArray.length <= 0) return []

  return playersArray.sort(function (a, b) {
    const scoreA = a.score || 0
    const scoreB = b.score || 0

    const secondsInRoundA = a.secondsInRound || Infinity
    const secondsInRoundB = b.secondsInRound || Infinity

    return scoreA < scoreB || scoreA === scoreB && secondsInRoundA > secondsInRoundB
  })
}
