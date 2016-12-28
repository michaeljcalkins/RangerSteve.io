import get from 'lodash/get'

export default function removePlayersThatLeft(data) {
    if (! RS.enemies) return

    RS.enemies.forEach((player, index) => {
        const playerId = get(player, 'data.id', false)

        // Does this enemy still exist in the data sent from the server
        const enemy = data.players[playerId]

        // Enemy not found so remove them from game
        if (! enemy && playerId) {
            console.log('Removing', player.data.id)
            RS.enemies.removeChildAt(index)
            player.destroy(true)
        }
    })
}
