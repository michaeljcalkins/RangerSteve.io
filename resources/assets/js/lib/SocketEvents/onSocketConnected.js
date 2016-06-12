export default function onSocketConnected() {
    const state = this.game.store.getState()

    window.socket.emit('new player', {
        roomId: state.room.id,
        x: 0,
        y: 0,
        weaponId: state.player.currentWeapon === 'primaryWeapon' ? state.player.selectedPrimaryWeaponId : state.player.selectedSecondaryWeaponId,
        nickname: state.player.nickname
    })
}
