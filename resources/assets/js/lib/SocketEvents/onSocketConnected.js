import getParameterByName from '../GetParameterByName.js'

export default function onSocketConnected() {
    const { store } = this.game

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
