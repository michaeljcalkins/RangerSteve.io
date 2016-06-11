import { PropTypes } from 'react'
import PlayerById from '../PlayerById'

const propTypes = {
    id: PropTypes.string.isRequired
}

export default function onRemovePlayer(data) {
    check(data, propTypes)

    console.log('REMOVE PLAYER')

    let removePlayer = PlayerById.call(this, data.id)

    // Player not found
    if (! removePlayer) {
        console.log('Player not found: ', data.id)
        return
    }

    removePlayer.player.kill()

    // Remove player from array
    this.enemies.splice(this.enemies.indexOf(removePlayer), 1)
}
