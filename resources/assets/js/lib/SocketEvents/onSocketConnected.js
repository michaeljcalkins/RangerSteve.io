import getParameterByName from '../GetParameterByName.js'

export default function onSocketConnected() {
    const { store } = this.game

    window.SOCKET_ID = window.socket.id.replace('/#', '')

    if (getParameterByName('roomId')) {
        mixpanel.track('player:joinedByRoomId')
    }

    console.log('Connected to server...')

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
