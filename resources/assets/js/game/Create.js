export default function Create() {
    window.Meta = {
        kickPlayerByUsername: (nickname) => {
            return window.socket.emit('kick player', {
                roomId: this.game.store.getState().room.id,
                nickname
            })
        }
    }
}
