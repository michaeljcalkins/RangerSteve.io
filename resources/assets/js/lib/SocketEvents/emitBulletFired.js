import { PropTypes } from 'react'

const propTypes = {
    roomId: PropTypes.string.isRequired,
    bulletId: PropTypes.string.isRequired,
    playerId: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    pointerAngle: PropTypes.number.isRequired,
    bulletSpeed: PropTypes.number.isRequired,
    damage: PropTypes.number.isRequired,
    weaponId: PropTypes.string.isRequired
}

export default function(data) {
    window.socket.emit('bullet fired', data)
}
