var admin = require("firebase-admin")
var _ = require('lodash')

var serviceAccount = require("../rangersteve-5d1fc-firebase-adminsdk-kdrzl-6a5e4f7224.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://rangersteve-5d1fc.firebaseio.com',
  databaseAuthVariableOverride: {
    uid: 'server-side-app'
  }
})

const savePlayerScoresToFirebase = function (room) {
  Object.keys(room.players).forEach(function (playerId) {
    console.log(room.players[playerId].uid)
    if (!room.players[playerId].uid) return
    admin.database()
      .ref('leaderboards/' + room.players[playerId].uid)
      .once('value', function (snapshot) {
        const leaderboardRecord = snapshot.val()
        if (!leaderboardRecord) return

        console.log(room.players[playerId].kills)

        const bulletsFired = leaderboardRecord.bulletsFired + room.players[playerId].bulletsFired
        const bulletsHit = leaderboardRecord.bulletsHit + room.players[playerId].bulletsHit
        const damageInflicted = leaderboardRecord.damageInflicted + room.players[playerId].damageInflicted
        const deaths = leaderboardRecord.deaths + room.players[playerId].deaths
        const headshots = leaderboardRecord.headshots + room.players[playerId].headshots
        const kills = room.players[playerId].kills + leaderboardRecord.kills
        const bestKillingSpree = leaderboardRecord.bestKillingSpree && leaderboardRecord.bestKillingSpree > room.players[playerId].bestKillingSpree
          ? room.players[playerId].bestKillingSpree
          : 0

        admin.database().ref('leaderboards/' + room.players[playerId].uid).set({
          bestKillingSpree: bestKillingSpree,
          bulletsFired: bulletsFired,
          bulletsHit: bulletsHit,
          damageInflicted: damageInflicted,
          deaths: deaths,
          headshots: headshots,
          kills: kills,
        }, function (err) {
          if (err) {
            console.log(err)
            return
          }
        })
      })
  })
}

module.exports = savePlayerScoresToFirebase
