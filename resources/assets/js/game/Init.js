import SetEventHandlers from '../lib/SocketEvents/setEventHandlers'
import actions from '../actions'

export default function Init() {
    this.game.renderer.renderSession.roundPixels = true
    this.game.stage.disableVisibilityChange = true

    const socket = io.connect()
    this.game.store.dispatch(actions.socket.setSocket(socket))
    this.game.store.dispatch(actions.game.setState('loading'))
    SetEventHandlers.call(this)
}
