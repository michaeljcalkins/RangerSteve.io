import get from 'lodash/get'

export default function(room) {
    // 200 seconds tracked in game
    // 4 kills
    // 180 / 60 = 3 minutes
    // 4 kills / 3 minutes
    let playerMeta = false
    Object.keys(room.players).forEach((player) => {
        if (room.players[player].data.secondsInRound < 60) return

        const minutesInRound = room.players[player].data.secondsInRound / 60
        room.players[player].data.killsPerMinute = (room.players[player].data.kills / minutesInRound).toFixed(1)

        if (room.players[player].data.killsPerMinute > get(playerMeta, 'killsPerMinute', 0)) {
            playerMeta = room.players[player].data
        }
    })

    if (! playerMeta) return false

    return {
        nickname: playerMeta.nickname,
        score: playerMeta.killsPerMinute,
    }
}