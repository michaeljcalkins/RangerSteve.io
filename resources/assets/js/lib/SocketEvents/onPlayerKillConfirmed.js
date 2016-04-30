import { PropTypes } from 'react'
import EventHandler from '../EventHandler'

const propTypes = {
    id: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired
}

export default function onPlayerKillConfirmed(data) {
    check(data, propTypes)

    if (data.id !== ('/#' + this.socket.id))
        return

    EventHandler.emit('player kill confirmed')
}
