import actions from '../actions'

export default function Create() {
    this.game.renderer.renderSession.roundPixels = true
    this.game.stage.disableVisibilityChange = true

    window.Meta = {
        kickPlayerByUsername: (nickname) => {
            return window.socket.emit('kick player', {
                roomId: this.game.store.getState().room.id,
                nickname
            })
        }
    }
}
