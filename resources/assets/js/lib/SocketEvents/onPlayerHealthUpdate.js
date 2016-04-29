import EventHandler from '../EventHandler'
import { PropTypes } from 'react'

const propTypes = {
    id: PropTypes.string.isRequired,
    health: PropTypes.number.isRequired
}

export default function onPlayerHealthUpdate(data) {
    check(data, propTypes)

    if (data.id !== ('/#' + this.socket.id))
        return

    this.player.meta.health = data.health
    EventHandler.emit('health update', this.player.meta.health)
}
