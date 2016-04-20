import { PropTypes } from 'react'

const propTypes = {
    roomId: PropTypes.string.isRequired,
    bulletId: PropTypes.string.isRequired
}

export default function(data) {
    check(data, propTypes)
    this.socket.emit('bullet removed', data)
}
