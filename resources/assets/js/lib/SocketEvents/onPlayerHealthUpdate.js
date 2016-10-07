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
    console.log('onPlayerHealthUpdate', data.id, ('/#' + window.socket.id))
    if (data.id !== window.socket.id) return

    store.dispatch(actions.player.setHealth(data.health))
}
