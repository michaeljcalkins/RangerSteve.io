import actions from '../../actions'

export default function onLoadGame(data) {
    if (this.game.state.current !== 'Boot') return

    console.log('test')
    const store = this.game.store
    store.dispatch(actions.room.setRoom(data.room))
    store.dispatch(actions.game.setChatMessages(data.room.messages.slice(-5)))
    this.game.state.start('Preloader', false)
}
