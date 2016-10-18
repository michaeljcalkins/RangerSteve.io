import getParameterByName from '../GetParameterByName.js'

// 1. send new player
// 2. receive load game
// 3. send load complete
// 4. receive update players

export default function onSocketConnected() {
    const { store } = this.game

    window.SOCKET_ID = window.socket.id.replace('/#', '')

    if (getParameterByName('roomId')) {
        mixpanel.track('player:joinedByRoomId')
    }

    window.socket.emit('new player', {
        roomId: getParameterByName('roomId'),
        map: getParameterByName('map'),
        x: 0,
        y: 0,
        weaponId: store.getState().player.currentWeapon === 'primaryWeapon'
            ? store.getState().player.selectedPrimaryWeaponId
            : store.getState().player.selectedSecondaryWeaponId,
        nickname: store.getState().player.nickname
    })
}
