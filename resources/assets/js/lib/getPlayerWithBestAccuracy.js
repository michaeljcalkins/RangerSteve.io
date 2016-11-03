import get from 'lodash/get'

export default function(room) {
    let playerMeta = false
    Object.keys(room.players).forEach(player => {
        if (room.players[player].meta.bulletsFired === 0) return

        // bullets fired / bullets that hit
        const accuracy = room.players[player].meta.bulletsHit / room.players[player].meta.bulletsFired * 100
        room.players[player].meta.accuracy = accuracy.toFixed(1)

        if (room.players[player].meta.accuracy > get(playerMeta, 'accuracy', 0)) {
            playerMeta = room.players[player].meta
        }
    })

    if (! playerMeta) return false

    return {
        nickname: playerMeta.nickname,
        score: playerMeta.accuracy + '%',
    }
}