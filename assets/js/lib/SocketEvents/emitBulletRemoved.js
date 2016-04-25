import { PropTypes } from 'react'

const propTypes = {
    roomId: PropTypes.string.isRequired,
    bulletId: PropTypes.string.isRequired,
    hasDamagedPlayer: PropTypes.bool,
    bulletX: PropTypes.number,
    bulletY: PropTypes.number,
    playerX: PropTypes.number,
    playerY: PropTypes.number,
    bulletRotation: PropTypes.number
}

export default function(data) {
    check(data, propTypes)
    this.socket.emit('bullet removed', data)
}
