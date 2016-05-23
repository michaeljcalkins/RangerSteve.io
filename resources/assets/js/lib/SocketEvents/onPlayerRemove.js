import { PropTypes } from 'react'

const propTypes = {
    id: PropTypes.string.isRequired
}

export default function onPlayerRemove(data) {
    check(data, propTypes)

    if (data.id === ('/#' + this.socket.id)) {
        location.reload()
        return
    }
}
