import find from 'lodash/find'
import get from 'lodash/get'

export default function(room) {
    // 200 seconds tracked in game
    // 4 kills
    // 180 / 60 = 3 minutes
    // 4 kills / 3 minutes
    let bestPlayer = false
    room.players.forEach((player) => {
        const selectedPlayer = find(room.players, { id: player.id })
        if (selectedPlayer.secondsInRound < 60) return

        const minutesInRound = selectedPlayer.secondsInRound / 60
        selectedPlayer.killsPerMinute = (selectedPlayer.kills / minutesInRound).toFixed(1)

        if (selectedPlayer.killsPerMinute > get(bestPlayer, 'killsPerMinute', 0)) {
            bestPlayer = selectedPlayer
        }
    })

    if (! bestPlayer) return false

    return {
        nickname: bestPlayer.nickname,
        score: bestPlayer.killsPerMinute,
    }
}
