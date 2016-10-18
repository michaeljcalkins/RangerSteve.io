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

    store.dispatch(actions.room.setRoom(data.room))
    store.dispatch(actions.game.setChatMessages(data.room.messages.slice(-5)))

    // Maps[store.getState().room.map].preload.call(this)
    // this.currentMap = store.getState().room.map

    // this.game.load.onLoadComplete.add(() => {
    //     CreateHandler.call(this)

    //     window.socket.emit('load complete', {
    //         roomId: store.getState().room.id
    //     })
    // }, this)

    // this.game.load.start()

    this.game.state.start('AssetLoader', false)
}
