const firebaseDb = require('./firebaseDb')
const _ = require('lodash')

const savePlayerScoresToFirebase = function (room) {
  const playersSortedByScore = _.values(room.players)
      .sort((a, b) => a.score < b.score)

  Object.keys(room.players).forEach(function (playerId) {
    if (!room.players[playerId].uid) return

    firebaseDb.database()
      .ref('leaderboards/' + room.players[playerId].uid)
      .once('value', function (snapshot) {
        const leaderboardRecord = snapshot.val()
        let newLeaderboardRecord = leaderboardRecord || {}
        const leaderboardProperties = ['score', 'secondsInRound', 'kills', 'headshots', 'deaths', 'damageInflicted', 'bulletsHit', 'bulletsFired', 'timesHit', 'secondsInRound']

        leaderboardProperties.forEach(function (prop) {
          newLeaderboardRecord[prop] = _.get(leaderboardRecord, prop, 0) + room.players[playerId][prop]
        })

        newLeaderboardRecord.roundsLost = _.get(leaderboardRecord, 'roundsLost', 0)
        newLeaderboardRecord.roundsWon = _.get(leaderboardRecord, 'roundsWon', 0)
        if (
          (room.players[playerId].team === 'blue' && room.blueTeamScore > room.redTeamScore) ||
          (room.players[playerId].team === 'red' && room.redTeamScore > room.blueTeamScore) ||
          playersSortedByScore[0].id === playerId && playersSortedByScore.length > 1
        ) {
          newLeaderboardRecord.roundsWon++
        } else {
          newLeaderboardRecord.roundsLost++
        }

        newLeaderboardRecord.bestKillingSpree = room.players[playerId].bestKillingSpree > _.get(leaderboardRecord, 'bestKillingSpree', 0)
          ? room.players[playerId].bestKillingSpree
          : _.get(leaderboardRecord, 'bestKillingSpree', 0)

        firebaseDb.database()
          .ref('leaderboards/' + room.players[playerId].uid)
          .set(newLeaderboardRecord, function (err) {
            if (err) console.log(err)
          })
      })
  })
}

module.exports = savePlayerScoresToFirebase
