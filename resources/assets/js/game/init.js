import SetEventHandlers from '../lib/SocketEvents/setEventHandlers'

export default function Init(store) {
    this.game.renderer.renderSession.roundPixels = true
    this.game.stage.disableVisibilityChange = true
    this.socket = io.connect()
    SetEventHandlers.call(this)
    this.gameState = 'loading'
}
