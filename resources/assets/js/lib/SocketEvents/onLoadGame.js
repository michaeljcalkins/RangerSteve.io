import actions from 'actions'

export default function onLoadGame(data) {
    const store = this.game.store
    store.dispatch(actions.room.setRoom(data.room))
    store.dispatch(actions.game.setChatMessages(data.room.messages.slice(-5)))

    const newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?roomId=' + data.room.id
    window.history.pushState({ path: newurl }, '', newurl)

    this.game.state.start('Preloader', true, true)
}
