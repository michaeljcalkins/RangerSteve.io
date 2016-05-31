import store from 'store'

export default function onSocketConnected() {
    // Send local player data to the game server
    this.socket.emit('new player', {
        roomId: this.roomId,
        // x: this.player.x,
        // y: this.player.y,
        x: 0,
        y: 0,
        currentWeaponMeta: 'primaryWeapon',
        nickname: store.get('nickname')
    })
}
