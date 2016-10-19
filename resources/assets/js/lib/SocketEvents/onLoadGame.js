import actions from '../../actions'
import { PropTypes } from 'react'

const propTypes = {
    room: PropTypes.shape({
        id: PropTypes.string.isRequired,
        players: PropTypes.object.isRequired
    })
}

export default function onLoadGame(data) {
    const store = this.game.store

    store.dispatch(actions.room.setRoom(data.room))
    store.dispatch(actions.game.setChatMessages(data.room.messages.slice(-5)))
    this.game.state.start('Deathmatch', false)
}
