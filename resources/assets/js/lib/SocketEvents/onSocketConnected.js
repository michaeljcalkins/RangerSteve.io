export default function onSocketConnected() {
    window.socket.emit('new player', {
        roomId: this.game.store.getState().room.id,
        x: 0,
        y: 0,
        currentWeaponMeta: this.game.store.getState().player.currentWeapon,
        nickname: this.game.store.getState().player.nickname
    })
}
