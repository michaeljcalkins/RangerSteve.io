const get = require('lodash/get')

const firebaseDb = require('./firebaseDb')
const getSortedPlayers = require('./getSortedPlayers')

const savePlayerScoresToFirebase = function (room) {
  const sortedPlayers = getSortedPlayers(room.players)

  Object.keys(room.players).forEach(function (playerId) {
    if (!room.players[playerId].uid) return

    firebaseDb.database()
      .ref('leaderboards/' + room.players[playerId].uid)
      .once('value', function (snapshot) {
        const leaderboardRecord = snapshot.val()
        let newLeaderboardRecord = leaderboardRecord || {}
        const leaderboardProperties = ['score', 'secondsInRound', 'kills', 'headshots', 'deaths', 'damageInflicted', 'bulletsHit', 'bulletsFired', 'timesHit', 'secondsInRound']

        leaderboardProperties.forEach(function (prop) {
          newLeaderboardRecord[prop] = get(leaderboardRecord, prop, 0) + room.players[playerId][prop]
        })

        newLeaderboardRecord.roundsLost = get(leaderboardRecord, 'roundsLost', 0)
        newLeaderboardRecord.roundsWon = get(leaderboardRecord, 'roundsWon', 0)
        if (
          (room.players[playerId].team === 'blue' && room.blueTeamScore > room.redTeamScore) ||
          (room.players[playerId].team === 'red' && room.redTeamScore > room.blueTeamScore) ||
          sortedPlayers[0].id === playerId && sortedPlayers.length > 1
        ) {
          newLeaderboardRecord.roundsWon++
        } else {
          newLeaderboardRecord.roundsLost++
        }

        newLeaderboardRecord.bestKillingSpree = room.players[playerId].bestKillingSpree > get(leaderboardRecord, 'bestKillingSpree', 0)
          ? room.players[playerId].bestKillingSpree
          : get(leaderboardRecord, 'bestKillingSpree', 0)

        firebaseDb.database()
          .ref('leaderboards/' + room.players[playerId].uid)
          .set(newLeaderboardRecord, function (err) {
            if (err) console.log(err)
          })
      })
  })
}

module.exports = savePlayerScoresToFirebase
