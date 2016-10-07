import { PropTypes } from 'react'

const propTypes = {
    roomId: PropTypes.string.isRequired,
    damage: PropTypes.number.isRequired,
    damagedPlayerId: PropTypes.string.isRequired,
    attackingPlayerId: PropTypes.string,
    weaponId: PropTypes.string
}

export default function(data) {
    window.socket.emit('player damaged', data)
}
