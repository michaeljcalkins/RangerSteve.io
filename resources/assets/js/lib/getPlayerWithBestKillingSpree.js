import get from 'lodash/get'

export default function (room) {
  let bestPlayer = false
  Object.keys(room.players).forEach(playerId => {
    const selectedPlayer = room.players[playerId]

    if (selectedPlayer.bestKillingSpree > get(bestPlayer, 'bestKillingSpree', 0)) {
      bestPlayer = selectedPlayer
    }
  })

  if (!bestPlayer) return false

  return {
    nickname: bestPlayer.nickname,
    score: bestPlayer.bestKillingSpree
  }
}
