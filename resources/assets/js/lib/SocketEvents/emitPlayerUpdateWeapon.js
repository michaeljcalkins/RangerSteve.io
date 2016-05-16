import { PropTypes } from 'react'

const propTypes = {
    id: PropTypes.string.isRequired,
    roomId: PropTypes.string.isRequired,
    currentWeaponMeta: PropTypes.object.isRequired
}

export default function(data) {
    check(data, propTypes)
    this.socket.emit('player update weapon', data)
}
