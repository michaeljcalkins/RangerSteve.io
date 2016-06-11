import { PropTypes } from 'react'

const propTypes = {
    roomId: PropTypes.string.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    rightArmAngle: PropTypes.number.isRequired,
    leftArmAngle: PropTypes.number.isRequired,
    facing: PropTypes.string.isRequired
}

export default function(data) {
    check(data, propTypes)
    window.socket.emit('move player', data)
}
