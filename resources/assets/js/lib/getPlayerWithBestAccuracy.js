import get from 'lodash/get'

export default function(room) {
    let bestPlayer = false
    Object.keys(room.players).forEach(playerId => {
        const selectedPlayer = room.players[playerId]
        if (! selectedPlayer || selectedPlayer.bulletsFired === 0) return

        // bullets fired / bullets that hit
        const accuracy = selectedPlayer.bulletsHit / selectedPlayer.bulletsFired * 100
        selectedPlayer.accuracy = accuracy.toFixed(1)

        if (selectedPlayer.accuracy > get(selectedPlayer, 'accuracy', 0)) {
            bestPlayer = selectedPlayer
        }
    })

    if (! bestPlayer) return false

    return {
        nickname: bestPlayer.nickname,
        score: bestPlayer.accuracy + '%',
    }
}
