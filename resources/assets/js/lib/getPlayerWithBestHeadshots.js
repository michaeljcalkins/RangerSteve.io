import find from 'lodash/find'
import get from 'lodash/get'

export default function(room) {
    let bestPlayer = false
    room.players.forEach((player) => {
        const selectedPlayer = find(room.players, { id: player.id })
        if (selectedPlayer.headshots > get(bestPlayer, 'headshots', 0)) {
            bestPlayer = selectedPlayer
        }
    })

    if (! bestPlayer) return false

    return {
        nickname: bestPlayer.nickname,
        score: bestPlayer.headshots,
    }
}
