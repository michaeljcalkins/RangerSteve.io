import { PropTypes } from 'react'

const propTypes = {
    roomId: PropTypes.string.isRequired,
    damage: PropTypes.number.isRequired,
    damagedPlayerId: PropTypes.string.isRequired,
    attackingPlayerId: PropTypes.string.isRequired
}

export default function(data) {
    check(data, propTypes)
    this.socket.emit('player damaged', data)
}
