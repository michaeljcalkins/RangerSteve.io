import actions from 'actions'

export default function onRefreshRoom(data) {
    const store = this.game.store
    store.dispatch(actions.room.setRoom(data.room))
}
