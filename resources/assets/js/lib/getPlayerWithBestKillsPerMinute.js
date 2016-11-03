import get from 'lodash/get'

export default function(room) {
    // 200 seconds tracked in game
    // 4 kills
    // 180 / 60 = 3 minutes
    // 4 kills / 3 minutes
    let playerMeta = false
    Object.keys(room.players).forEach((player) => {
        if (room.players[player].meta.secondsInRound < 60) return

        const minutesInRound = room.players[player].meta.secondsInRound / 60
        room.players[player].meta.killsPerMinute = (room.players[player].meta.kills / minutesInRound).toFixed(1)

        if (room.players[player].meta.killsPerMinute > get(playerMeta, 'killsPerMinute', 0)) {
            playerMeta = room.players[player].meta
        }
    })

    if (! playerMeta) return false

    return {
        nickname: playerMeta.nickname,
        score: playerMeta.killsPerMinute,
    }
}