import { PropTypes } from 'react'
import actions from '../../actions'

const propTypes = {
    id: PropTypes.string.isRequired,
    health: PropTypes.number.isRequired
}

export default function onPlayerHealthUpdate(data) {
    check(data, propTypes)

    const store = this.game.store
    if (store.getState().game.state !== 'active') return
    if (data.id !== ('/#' + window.socket.id)) return

    this.player.meta.health = data.health
    this.game.store.dispatch(actions.player.setHealth(data.health))
}
