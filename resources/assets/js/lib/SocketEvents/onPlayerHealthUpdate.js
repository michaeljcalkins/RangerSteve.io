import { PropTypes } from 'react'
import actions from '../../actions'

const propTypes = {
    id: PropTypes.string.isRequired,
    health: PropTypes.number.isRequired
}

export default function onPlayerHealthUpdate(data) {
    const store = this.game.store

    if (data.id !== window.SOCKET_ID) return

    store.dispatch(actions.player.setHealth(data.health))
}
