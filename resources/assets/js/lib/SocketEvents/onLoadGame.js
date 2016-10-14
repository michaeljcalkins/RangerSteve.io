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
    const store = this.game.store

    if (store.getState().game.state !== 'loading') return

    console.log('Loading game...')

    store.dispatch(actions.room.setRoom(data.room))
    store.dispatch(actions.game.setChatMessages(data.room.messages.slice(-5)))

    mixpanel.time_event('map:' + store.getState().room.map)
    Maps[store.getState().room.map].preload.call(this)
    this.currentMap = store.getState().room.map

    this.game.load.onLoadComplete.add(() => {
        console.log('Load complete, initializing game...')
        CreateHandler.call(this)

        window.socket.emit('load complete', {
            roomId: store.getState().room.id
        })
    }, this)

    setInterval(() => {
        mixpanel.track('map:' + store.getState().room.map)
    }, 10000)

    this.game.load.start()
}
