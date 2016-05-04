import EventHandler from '../EventHandler'
import { PropTypes } from 'react'

const propTypes = {
    roomId: PropTypes.string.isRequired,
    playerNickname: PropTypes.string.isRequired,
    playerId: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
}

export default function onBulletFired(data) {
    check(data, propTypes)
    EventHandler.emit('message received', data)
}
