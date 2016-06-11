import actions from '../../actions'
import InitHandler from '../InitHandlers'
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
        this.enemies = this.game.add.group()

        InitHandler.call(this)

        store.dispatch(actions.game.setState('active'))

        console.log('LOAD GAME COMPLETE')
        window.socket.emit('load complete', {
            roomId: store.getState().room.id
        })
    }, this)

    this.load.start()
}
