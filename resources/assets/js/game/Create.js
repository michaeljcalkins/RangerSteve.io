import actions from '../actions'
import SetEventHandlers from '../lib/SocketEvents/SetEventHandlers'

export default function Create() {
    this.game.store.dispatch(actions.game.setState('loading'))

    this.game.renderer.renderSession.roundPixels = true
    this.game.stage.disableVisibilityChange = true

    SetEventHandlers.call(this)

    window.Meta = {
        kickPlayerByUsername: (nickname) => {
            return window.socket.emit('kick player', {
                roomId: this.game.store.getState().room.id,
                nickname
            })
        }
    }
}
