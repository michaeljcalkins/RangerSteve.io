import SetEventHandlers from '../lib/SocketEvents/setEventHandlers'
import actions from '../actions'

export default function Init() {
    this.game.store.dispatch(actions.game.setState('loading'))

    this.game.renderer.renderSession.roundPixels = true
    this.game.stage.disableVisibilityChange = true

    SetEventHandlers.call(this)
}
