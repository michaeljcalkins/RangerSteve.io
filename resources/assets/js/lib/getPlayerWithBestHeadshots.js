import get from 'lodash/get'

export default function(room) {
    let playerMeta = false
    Object.keys(room.players).forEach((player) => {
        if (room.players[player].data.headshots > get(playerMeta, 'headshots', 0)) {
            playerMeta = room.players[player].data
        }
    })

    if (! playerMeta) return false

    return {
        nickname: playerMeta.nickname,
        score: playerMeta.headshots,
    }
}
