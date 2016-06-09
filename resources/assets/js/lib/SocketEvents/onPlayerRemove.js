import { PropTypes } from 'react'

const propTypes = {
    id: PropTypes.string.isRequired
}

export default function onPlayerRemove(data) {
    check(data, propTypes)

    if (data.id === ('/#' + window.socket.id)) {
        location.reload()
        return
    }
}
