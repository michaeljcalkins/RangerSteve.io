import get from 'lodash/get'

export default function(room) {
    let playerMeta = false
    Object.keys(room.players).forEach((player) => {
        if (room.players[player].meta.headshots > get(playerMeta, 'headshots', 0)) {
            playerMeta = room.players[player].meta
        }
    })

    if (! playerMeta) return false

    return {
        nickname: playerMeta.nickname,
        score: playerMeta.headshots,
    }
}