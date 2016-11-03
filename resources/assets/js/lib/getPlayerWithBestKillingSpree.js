import get from 'lodash/get'

export default function(room) {
    let playerMeta = false
    Object.keys(room.players).forEach((player) => {
        if (room.players[player].meta.bestKillingSpree > get(playerMeta, 'bestKillingSpree', 0)) {
            playerMeta = room.players[player].meta
        }
    })

    if (! playerMeta) return false

    return {
        nickname: playerMeta.nickname,
        score: playerMeta.bestKillingSpree,
    }
}