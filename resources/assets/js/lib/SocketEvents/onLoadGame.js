import actions from '../../actions'
import CreateHandler from '../CreateHandler'
import Maps from '../Maps'
import { PropTypes } from 'react'

const propTypes = {
    room: PropTypes.shape({
        id: PropTypes.string.isRequired,
        players: PropTypes.object.isRequired
    })
}

export default function onLoadGame(data) {
    check(data, propTypes)

    const store = this.game.store

    if (store.getState().game.state !== 'loading') return

    store.dispatch(actions.room.setRoom(data.room))

    Maps[store.getState().room.map].preload.call(this)
    this.currentMap = store.getState().room.map

    this.load.onLoadComplete.add(() => {
        CreateHandler.call(this)
        window.socket.emit('load complete', {
            roomId: store.getState().room.id
        })
    }, this)

    this.load.start()
}
